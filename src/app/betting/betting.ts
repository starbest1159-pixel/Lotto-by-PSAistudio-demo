/* eslint-disable */
import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

interface WorkspaceBet {
  id: string;
  number: string;
  type: string;
  amount: number;
  selected: boolean;
}

@Component({
  selector: 'app-betting',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] h-auto text-slate-800">
      
      <!-- Left Side: Interactive Betting & Intelligent AI Workspace -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fade-in_0.3s_ease]">
        
        <!-- Header with Interactive Lottery Selector & Flags -->
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex flex-1 items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-slate-950 text-white flex flex-col items-center justify-center shadow-md shrink-0">
              <span class="text-lg leading-none">{{ getActiveLotteryFlag() }}</span>
              <span class="text-[9px] font-bold opacity-80 mt-0.5 font-mono">{{ getActiveLotteryShort() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  กำลังเลือกแทง
                </span>
              </div>
              <div class="relative mt-1 max-w-[240px]">
                <select 
                  [ngModel]="selectedLottery()"
                  (ngModelChange)="onLotteryChange($event)"
                  class="w-full text-sm font-bold p-1.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500 text-slate-900 cursor-pointer"
                >
                  @for (l of activeLotteries(); track l.id) {
                    <option [value]="l.id">{{ l.flag }} {{ l.name }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
          <div class="text-left sm:text-right shrink-0">
            <div class="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5 font-bold">งวดปัจจุบัน</div>
            <div class="text-sm font-bold text-slate-955 flex items-center">
              <i class="bi bi-calendar-check text-emerald-600 mr-1.5"></i>
              {{ getActiveLotteryPeriod() }} (เปิดรับแทง)
            </div>
          </div>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="px-4 py-2 border-b border-slate-200 bg-slate-50/50">
          <div class="flex p-1 bg-slate-100 rounded-xl">
            <button 
              class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
              [class]="mode() === 'select' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              (click)="mode.set('select')"
            >
              <i class="bi bi-grid-3x3-gap mr-2"></i>
              คีย์ธรรมดา / กดเลือกเลข
            </button>
            <button 
              class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
              [class]="mode() === 'text' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              (click)="mode.set('text')"
            >
              <i class="bi bi-keyboard mr-2"></i>
              คีย์ด่วนแบบข้อความ (Text)
            </button>
            <button 
              class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
              [class]="mode() === 'ocr' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-indigo-600'"
              (click)="mode.set('ocr')"
            >
              <i class="bi bi-stars mr-2"></i>
              สแกน OCR & แปลงโพยอัจฉริยะ (AI Workspace)
            </button>
          </div>
        </div>

        <!-- Interactive Area Scrollable -->
        <div class="flex-1 overflow-y-auto p-6 bg-slate-50/20">

          <!-- TAB 1: QUICK CLICK / NUMBER PAD -->
          @if (mode() === 'select') {
            <div class="space-y-6">
              <!-- Bet Types Selection -->
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                @for (type of betTypes; track type.id) {
                  <button 
                    class="py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
                    [class]="selectedType() === type.id ? 'bg-slate-950 border-slate-950 text-white font-black' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
                    (click)="selectedType.set(type.id)"
                  >
                    {{ type.name }}
                  </button>
                }
              </div>

              <!-- Number Pad Area -->
              <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto">
                <div class="flex items-center space-x-4 mb-6">
                  <div class="flex-1">
                    <div class="block text-xs font-bold text-slate-400 mb-1">ตัวเลขที่ต้องการแทง</div>
                    <input 
                      type="text" 
                      [(ngModel)]="currentNumber"
                      class="w-full text-center text-3xl font-mono font-bold py-2 border-b-2 border-slate-200 focus:border-slate-900 focus:outline-hidden bg-transparent text-slate-900"
                      placeholder="000"
                      maxlength="3"
                    >
                  </div>
                  <div class="w-px h-12 bg-slate-200"></div>
                  <div class="flex-grow flex-1">
                    <div class="block text-xs font-bold text-slate-400 mb-1">ราคาเดิมพัน (บาท)</div>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                      <input 
                        type="number" 
                        [(ngModel)]="currentAmount"
                        class="w-full text-right text-2xl font-bold py-2 pl-8 pr-2 border-b-2 border-slate-200 focus:border-slate-900 focus:outline-hidden bg-transparent text-slate-900"
                        placeholder="0"
                      >
                    </div>
                  </div>
                </div>

                <!-- Digit Keyboard -->
                <div class="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                  @for (n of [1,2,3,4,5,6,7,8,9]; track n) {
                    <button 
                      (click)="appendNumber(n.toString())"
                      class="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-lg font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      {{ n }}
                    </button>
                  }
                  <button 
                    class="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                    (click)="clearNumber()"
                  >
                    <i class="bi bi-backspace-fill text-lg"></i>
                  </button>
                  <button 
                    (click)="appendNumber('0')"
                    class="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-lg font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    0
                  </button>
                  <button 
                    class="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    (click)="addBet()"
                  >
                    <i class="bi bi-plus-lg text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- TAB 2: RAPID TEXT INPUT -->
          @if (mode() === 'text') {
            <div class="space-y-4">
              <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
                <span class="font-bold block mb-1">
                  <i class="bi bi-info-circle-fill mr-1"></i>
                  รูปแบบการป้อนข้อมูลด้วยตัวอักษรด่วน:
                </span>
                <span>พิมพ์แบบผสมตัวเลขกับเครื่องหมายเท่ากับ (เช่น 123=100=100 [ตัวแรกคือบน ตัวสองคือโต๊ด], หรือ 45=50 [สองตัวตรงบน]) แยกรหัสแต่ละบรรทัด</span>
              </div>
              
              <textarea 
                [(ngModel)]="quickText"
                rows="10"
                class="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-base resize-none shadow-xs bg-white text-slate-900"
                placeholder="พิมพ์ตัวเลขสลับราคา เช่น&#10;123=100=50&#10;89=200&#10;74=50=50"
              ></textarea>
              
              <button 
                (click)="parseQuickText()"
                class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center text-sm"
              >
                <i class="bi bi-file-earmark-plus mr-2"></i>
                ดึงข้อความเข้าสรุปโพยหลัก
              </button>
            </div>
          }

          <!-- TAB 3: AI SMART OCR SCANNER & WORKSPACE (THE REVOLUTION!) -->
          @if (mode() === 'ocr') {
            <div class="space-y-6">
              
              <!-- Top Source Input Grids -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Left Source Card: Text Area or File Upload -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 class="text-sm font-bold text-slate-900 flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-2"></span>
                    ป้อนข้อมูลแหล่งโพยหวย
                  </h3>

                  <!-- Drag & Drop Upload Zone -->
                  <div 
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onFileDropped($event)"
                    [class]="isDragging() ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'"
                    class="border-2 border-dashed rounded-xl p-6 text-center transition-all relative cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      class="absolute inset-0 opacity-0 cursor-pointer"
                      (change)="onFileSelected($event)"
                      id="ocr-file-upload"
                    >
                    <div class="space-y-2">
                      <i class="bi bi-cloud-arrow-up text-3xl text-slate-400 group-hover:text-indigo-600 transition-colors"></i>
                      <div class="text-xs font-bold text-slate-700">ลากและวางรูปภาพโพยหวย หรือ คลิกเพื่ออัปโหลด</div>
                      <div class="text-[10px] text-slate-400">รองรับไฟล์ภาพเขียนมือ ภาพถ่ายหน้าจอ ลื่นไหล ไม่กระตุก</div>
                    </div>
                  </div>

                  <!-- OR Separator Divider -->
                  <div class="relative flex py-1 items-center">
                    <div class="flex-grow border-t border-slate-200"></div>
                    <span class="flex-shrink mx-4 text-xs font-bold text-slate-400">หรือวางข้อความโพยดิบ</span>
                    <div class="flex-grow border-t border-slate-200"></div>
                  </div>

                  <!-- Text Area Parsing -->
                  <div>
                    <textarea 
                      [(ngModel)]="ocrTextInput"
                      rows="4"
                      class="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                      placeholder="วางข้อความแชทลูกค้า หรือคำสั่งภาษาไทยทั่วไป เช่น '123 บน 100 โต๊ด 50, ล่าง 45 คูณ 100'"
                    ></textarea>
                  </div>

                  <div class="flex gap-2">
                    <button 
                      (click)="triggerTextParsing()"
                      [disabled]="ocrLoading() || !ocrTextInput.trim()"
                      class="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    >
                      <i class="bi bi-stars mr-1.5"></i>
                      แปลงข้อความด้วย AI
                    </button>
                    <button 
                      (click)="clearOcrWorkspace()"
                      class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      ล้างห้องงาน
                    </button>
                  </div>
                </div>

                <!-- Right Source Card: Live AI Metrics & Analysis Summary -->
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 flex items-center mb-3">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                      แดชบอร์ดสรุปและวิเคราะห์ผลลัพธ์ (AI Metrics)
                    </h3>

                    @if (parsedWorkspaceBets().length === 0) {
                      <div class="h-28 flex flex-col items-center justify-center text-slate-400 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <i class="bi bi-bar-chart-line text-2xl opacity-40 mb-1"></i>
                        <span class="text-xs">อัปโหลดภาพหรือประมวลผลข้อความเพื่อรับข้อมูลสถิติ</span>
                      </div>
                    } @else {
                      <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <span class="block text-[10px] font-bold text-slate-400">รายการแทงทั้งหมด</span>
                          <span class="text-lg font-black text-slate-900 font-mono">{{ parsedWorkspaceBets().length }}</span>
                        </div>
                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <span class="block text-[10px] font-bold text-slate-400">คัดเลือกแล้ว</span>
                          <span class="text-lg font-black text-indigo-600 font-mono">
                            {{ selectedWorkspaceCount() }} / {{ parsedWorkspaceBets().length }}
                          </span>
                        </div>
                        <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 col-span-2">
                          <span class="block text-[10px] font-bold text-slate-400">ยอดเงินรวมในห้องงาน</span>
                          <span class="text-base font-black text-emerald-600 font-mono">
                            ฿{{ totalWorkspaceAmount() | number }} บาท
                          </span>
                        </div>
                      </div>

                      <!-- Digit Frequencies Analysis -->
                      <div>
                        <span class="block text-xs font-bold text-slate-900 mb-1.5 flex items-center">
                          <i class="bi bi-graph-up-arrow text-indigo-600 mr-1.5"></i>
                          วิเคราะห์เลขเด่นและเลขซ้ำบ่อย:
                        </span>
                        <div class="flex flex-wrap gap-1.5">
                          @for (item of digitFrequencies().slice(0, 5); track item.digit) {
                            <span class="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center">
                              เลข <strong class="text-indigo-600 mx-1 font-mono text-sm">{{ item.digit }}</strong> 
                              <span class="text-[10px] text-slate-400 font-normal">({{ item.count }} ครั้ง)</span>
                            </span>
                          }
                          @if (digitFrequencies().length === 0) {
                            <span class="text-xs text-slate-400">ไม่มีสถิติตัวเลข</span>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Alert duplicate messages -->
                  @if (hasDuplicates()) {
                    <div class="mt-3 bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs flex items-center">
                      <i class="bi bi-exclamation-triangle-fill text-amber-500 mr-2 text-sm shrink-0"></i>
                      <span><strong>พบชุดเลขซ้ำกัน:</strong> แนะนำให้ใช้ปุ่ม "ยุบรวมยอดซ้ำ" เพื่อรวมรายการเป็นยอดเดียว</span>
                    </div>
                  }
                </div>

              </div>

              <!-- OCR Loading Spinner Overlay -->
              @if (ocrLoading()) {
                <div class="bg-white border border-indigo-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-xs animate-pulse">
                  <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h4 class="text-sm font-bold text-slate-900">กำลังถอดข้อความและวิเคราะห์ความหมายด้วย AI...</h4>
                  <p class="text-xs text-slate-400 mt-1">โมเดลวิเคราะห์การคัดแยกบนล่าง, โต๊ด, และแตกเลขตามโพยของท่านทันที</p>
                </div>
              }

              <!-- WORKSPACE BATCH TOOLBAR & WORK LIST TABLE -->
              @if (parsedWorkspaceBets().length > 0) {
                <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  
                  <!-- Batch Toolbar Header -->
                  <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs font-bold text-slate-700">เครื่องมือจัดการกลุ่ม:</span>
                      
                      <!-- Duplicate Consolidator -->
                      <button 
                        (click)="consolidateDuplicates()"
                        class="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center"
                        title="ยุบรวมราคาเลขที่ตัวเลขและประเภทซ้ำกัน"
                      >
                        <i class="bi bi-layers mr-1.5"></i>
                        ยุบรวมยอดซ้ำ
                      </button>

                      <!-- Random Filter Trigger Modal -->
                      <button 
                        (click)="toggleRandomFilterModal()"
                        class="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center"
                        title="สุ่มคัดเลขเด็ดออกตามงบประมาณ"
                      >
                        <i class="bi bi-shuffle mr-1.5"></i>
                        สุ่มตัดเลือกเลข
                      </button>

                      <!-- Toggle All Checkbox helper -->
                      <button 
                        (click)="toggleSelectAllWorkspace()"
                        class="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center"
                      >
                        <i class="bi bi-check-all mr-1.5"></i>
                        เลือก/ไม่เลือกทั้งหมด
                      </button>
                    </div>

                    <!-- Search Quick Search Box -->
                    <div class="relative max-w-xs w-full">
                      <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                      <input 
                        type="text" 
                        [(ngModel)]="workspaceSearchQuery"
                        placeholder="ค้นหาด่วน (เลข หรือประเภท)..."
                        class="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900"
                      >
                    </div>
                  </div>

                  <!-- Workspace Table Content -->
                  <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider">
                          <th class="py-2.5 px-4 text-center w-12">เลือก</th>
                          <th class="py-2.5 px-3">ตัวเลขหวย</th>
                          <th class="py-2.5 px-3">ประเภทเดิมพัน</th>
                          <th class="py-2.5 px-3 w-32">ราคาเดิมพัน (฿)</th>
                          <th class="py-2.5 px-4 text-center w-48">แตกตัวเลข / จัดการแถว</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-medium">
                        @for (bet of filteredWorkspaceBets(); track bet.id) {
                          <tr class="hover:bg-slate-50/50 transition-colors" [class.bg-indigo-50/10]="bet.selected">
                            <td class="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                [(ngModel)]="bet.selected"
                                class="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              >
                            </td>
                            <td class="py-3 px-3 font-mono text-base font-black text-slate-950">
                              <input 
                                type="text" 
                                [(ngModel)]="bet.number" 
                                class="w-16 text-center font-mono font-bold bg-slate-100 border border-slate-200 rounded-sm py-0.5 text-slate-900"
                              >
                            </td>
                            <td class="py-3 px-3 text-slate-600">
                              <select 
                                [(ngModel)]="bet.type" 
                                class="bg-white border border-slate-200 rounded-sm py-0.5 text-xs text-slate-900"
                              >
                                @for (t of betTypes; track t.id) {
                                  <option [value]="t.id">{{ t.name }}</option>
                                }
                              </select>
                            </td>
                            <td class="py-3 px-3 text-slate-900">
                              <div class="relative max-w-[100px]">
                                <span class="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400">฿</span>
                                <input 
                                  type="number" 
                                  [(ngModel)]="bet.amount"
                                  class="w-full text-right bg-white border border-slate-200 rounded-sm py-0.5 pl-4 pr-1 text-xs font-bold text-slate-900"
                                >
                              </div>
                            </td>
                            <td class="py-3 px-4 text-center space-x-1.5">
                              <!-- Quick Expand Buttons based on digits -->
                              @if (bet.number.length === 2) {
                                <button 
                                  (click)="expandRowToReverse(bet)"
                                  class="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold cursor-pointer"
                                  title="กลับเลข 2 ตัว เช่น 45 -> 45, 54"
                                >
                                  <i class="bi bi-arrow-left-right mr-1"></i>กลับตัว
                                </button>
                                <button 
                                  (click)="expandRowTo19Doors(bet)"
                                  class="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold cursor-pointer"
                                  title="แตกเลข 19 ประตู"
                                >
                                  <i class="bi bi-door-open mr-1"></i>19 ประตู
                                </button>
                              } @else if (bet.number.length === 3) {
                                <button 
                                  (click)="expandRowTo6Lines(bet)"
                                  class="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold cursor-pointer"
                                  title="แตกเลขกลับ 6 ประตู"
                                >
                                  <i class="bi bi-arrow-repeat mr-1"></i>กลับ 6 ประตู
                                </button>
                              }
                              <button 
                                (click)="removeWorkspaceBet(bet.id)"
                                class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                title="ลบแถวนี้"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <!-- Footer actions for importing workspace to main slips -->
                  <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span class="text-xs text-slate-500 font-bold">
                      เลือกอยู่ <span class="text-indigo-600 font-bold">{{ selectedWorkspaceCount() }}</span> รายการจากทั้งหมด 
                      (ยอดเงินรวมห้องงาน: ฿{{ totalWorkspaceAmount() | number }} บาท)
                    </span>

                    <div class="flex space-x-2">
                      <button 
                        (click)="importSelectedToMainSlip()"
                        [disabled]="selectedWorkspaceCount() === 0"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center cursor-pointer"
                      >
                        <i class="bi bi-download mr-1.5"></i>
                        ยืนยันเพิ่มเข้าในใบโพยหลัก
                      </button>
                    </div>
                  </div>

                </div>
              }

            </div>
          }

        </div>
      </div>

      <!-- Right Side: Unified Bet Slip Receipt Generator & Banking configuration -->
      <div class="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fade-in_0.3s_ease]">
        
        <!-- Tab Switcher for right side: Slip summary or Bank Configuration -->
        <div class="flex border-b border-slate-200 bg-slate-800 text-white">
          <button 
            (click)="rightTab.set('slip')"
            class="flex-1 py-3 text-xs font-bold border-b-2 text-center cursor-pointer"
            [class]="rightTab() === 'slip' ? 'border-indigo-400 bg-slate-700 text-white' : 'border-transparent text-slate-400 hover:text-white'"
          >
            <i class="bi bi-receipt mr-1.5"></i>
            ใบสรุปโพย ({{ bets().length }})
          </button>
          <button 
            (click)="rightTab.set('bank')"
            class="flex-1 py-3 text-xs font-bold border-b-2 text-center cursor-pointer"
            [class]="rightTab() === 'bank' ? 'border-emerald-400 bg-slate-700 text-white' : 'border-transparent text-slate-400 hover:text-white'"
          >
            <i class="bi bi-bank mr-1.5"></i>
            ตั้งค่าผู้เชื่อมต่อธนาคาร
          </button>
        </div>

        <!-- RIGHT CONTENT: SLIP SUMMARY -->
        @if (rightTab() === 'slip') {
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @if (bets().length === 0) {
              <div class="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <i class="bi bi-file-earmark-text text-4xl text-slate-300 mb-2"></i>
                <p class="font-bold text-sm text-slate-500">ยังไม่มีรายการแทงในโพย</p>
                <p class="text-xs text-slate-400 mt-1">ใช้ตัวคีย์ด่วน, กดเลข หรือสแกน OCR เพื่อเพิ่มยอด</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (bet of bets(); track bet.id) {
                  <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                    <div class="flex items-center space-x-3">
                      <button 
                        (click)="removeBet(bet.id)"
                        class="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <i class="bi bi-x-circle"></i>
                      </button>
                      <div>
                        <div class="font-mono font-bold text-base text-slate-900">{{ bet.number }}</div>
                        <div class="text-[10px] text-slate-500">{{ getTypeName(bet.type) }}</div>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="font-bold text-slate-900 text-sm">฿{{ bet.amount | number }}</div>
                      <div class="text-[10px] text-emerald-600 font-bold">จ่าย x{{ bet.payRate }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Bottom Summary Actions -->
          <div class="p-4 border-t border-slate-200 bg-slate-50">
            <div class="space-y-2 mb-4 text-xs font-bold">
              <div class="flex justify-between text-slate-600">
                <span>ยอดรวมดิบ</span>
                <span>฿{{ totalAmount() | number }}</span>
              </div>
              <div class="flex justify-between text-emerald-600">
                <span>ส่วนลดพิเศษ (5%)</span>
                <span>-฿{{ discount() | number }}</span>
              </div>
              <div class="w-full h-px bg-slate-200 my-1"></div>
              <div class="flex justify-between text-sm text-slate-950 font-extrabold">
                <span>ยอดชำระสุทธิ</span>
                <span class="text-lg text-emerald-600 font-black">฿{{ netAmount() | number }}</span>
              </div>
            </div>

            <!-- Export Vouchers and Submits -->
            <div class="grid grid-cols-2 gap-2 mb-2">
              <button 
                (click)="exportToCSV()"
                [disabled]="bets().length === 0"
                class="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                <i class="bi bi-file-earmark-excel text-emerald-600 mr-1.5"></i>
                ส่งออก CSV
              </button>
              <button 
                (click)="openReceiptModal()"
                [disabled]="bets().length === 0"
                class="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                <i class="bi bi-image text-indigo-600 mr-1.5"></i>
                ดูบิล & สแกนรับเงิน
              </button>
            </div>
            
            <div class="flex space-x-2">
              <button 
                (click)="clearAll()"
                class="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ล้างทั้งหมด
              </button>
              <button 
                [disabled]="bets().length === 0"
                (click)="submitBets()"
                class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
              >
                <i class="bi bi-check2-all mr-1.5 text-sm"></i>
                ยืนยันการแทงส่งหลังบ้าน
              </button>
            </div>
          </div>
        }

        <!-- RIGHT CONTENT: BANK CONFIGURATION -->
        @if (rightTab() === 'bank') {
          <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">ข้อมูลรับเงินบัญชีเจ้ามือ</h3>
            
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div>
                <div class="block text-[10px] font-bold text-slate-500 mb-1">สถาบันการเงิน / ธนาคาร</div>
                <select 
                  [(ngModel)]="bankInfo.bankName"
                  class="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-slate-900 font-bold"
                >
                  <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBank)</option>
                  <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ (BBL)</option>
                  <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</option>
                  <option value="ธนาคารออมสิน">ธนาคารออมสิน (GSB)</option>
                  <option value="ทรูมันนี่ วอลเล็ท">ทรูมันนี่ วอลเล็ท (TrueMoney)</option>
                </select>
              </div>

              <div>
                <div class="block text-[10px] font-bold text-slate-500 mb-1">ชื่อบัญชีผู้รับเงิน</div>
                <input 
                  type="text" 
                  [(ngModel)]="bankInfo.accountName"
                  class="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-slate-900 font-bold"
                  placeholder="ชื่อ-นามสกุล หรือ บัญชีผู้รับ"
                >
              </div>

              <div>
                <div class="block text-[10px] font-bold text-slate-500 mb-1">เลขที่บัญชีธนาคาร</div>
                <input 
                  type="text" 
                  [(ngModel)]="bankInfo.accountNumber"
                  class="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-slate-900 font-bold"
                  placeholder="000-0-00000-0"
                >
              </div>

              <div>
                <div class="block text-[10px] font-bold text-slate-500 mb-1">เบอร์มือถือ หรือ ID พร้อมเพย์ (PromptPay)</div>
                <input 
                  type="text" 
                  [(ngModel)]="bankInfo.promptpayId"
                  class="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-slate-900 font-bold"
                  placeholder="เบอร์โทรศัพท์ 10 หลัก หรือ เลขบัตรประชาชน"
                >
              </div>
            </div>

            <!-- bank instruction banner -->
            <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[10px] text-indigo-900 flex items-start">
              <i class="bi bi-shield-check text-indigo-600 text-sm mr-2 shrink-0"></i>
              <div>
                <strong>พร้อมเชื่อมต่อระบบธนาคารเรียลไทม์:</strong> ข้อมูลบัญชีด้านบนจะถูกบันทึกเพื่อใช้สร้างลิงก์การชำระเงินคิวอาร์โค้ดแบบไดนามิกให้กับลูกค้าแทงหวยในทันที!
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <button 
              (click)="saveBankInfo()"
              class="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              บันทึกข้อมูลและอัปเดตระบบ
            </button>
          </div>
        }

      </div>
    </div>

    <!-- MODAL 1: RANDOM FILTER CHOOSE COUNT -->
    @if (isRandomFilterModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 flex items-center">
              <i class="bi bi-shuffle text-indigo-600 mr-2"></i>
              สุ่มเลือกเลข / กรองงบประมาณ
            </h3>
            <button (click)="isRandomFilterModalOpen.set(false)" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <p class="text-xs text-slate-500">กรุณาระบุจำนวนรายการแทงที่คุณต้องการเก็บสุ่มคัดเลือกไว้ (รายการที่เหลือจะถูกยกเลิกการเลือกชั่วคราว):</p>
          
          <div class="space-y-3">
            <div class="relative">
              <input 
                type="number" 
                [(ngModel)]="randomKeepCount"
                min="1"
                class="w-full text-sm p-2.5 border border-slate-300 rounded-xl text-center font-bold text-slate-900"
                placeholder="ระบุจำนวนรายการแทง"
              >
            </div>
            
            <div class="flex gap-2 text-xs">
              <button 
                (click)="applyQuickFilter(5)"
                class="flex-1 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
              >
                เลือก 5 รายการ
              </button>
              <button 
                (click)="applyQuickFilter(10)"
                class="flex-1 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
              >
                เลือก 10 รายการ
              </button>
              <button 
                (click)="applyQuickFilter(20)"
                class="flex-1 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
              >
                เลือก 20 รายการ
              </button>
            </div>
          </div>

          <div class="flex space-x-2 pt-2">
            <button 
              (click)="isRandomFilterModalOpen.set(false)"
              class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              (click)="triggerRandomKeep()"
              class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              ดำเนินการสุ่มกรอง
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 2: AESTHETIC PAPER BILL RECEIPT (HIGH FIDELITY OVERLAY) -->
    @if (isReceiptModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-slate-100/90 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-[fade-in_0.25s_ease] my-8">
          
          <!-- Close Button -->
          <button 
            (click)="isReceiptModalOpen.set(false)"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs cursor-pointer z-10"
          >
            <i class="bi bi-x-lg text-sm"></i>
          </button>

          <!-- The Aesthetics Thermal Bill Card -->
          <div class="bg-white border-2 border-slate-200 shadow-lg rounded-xl p-5 text-slate-800 font-sans space-y-4 relative overflow-hidden">
            
            <!-- Paper teeth edge graphics top/bottom -->
            <div class="absolute top-0 inset-x-0 h-1 bg-[radial-gradient(circle_at_bottom,transparent_4px,#e2e8f0_4px)] bg-[length:12px_12px] opacity-70"></div>
            
            <!-- Receipt Header -->
            <div class="text-center space-y-1 pt-2">
              <h2 class="text-base font-extrabold text-slate-900 tracking-wider">LOTZENI OFFICIAL VOUCHER</h2>
              <p class="text-[10px] text-slate-400 uppercase font-mono">บิลใบเสร็จสรุปยอดรายการแทงหวย</p>
              <div class="w-full border-t border-dashed border-slate-300 py-1"></div>
              
              <!-- Meta logs -->
              <div class="grid grid-cols-2 text-left text-[9px] font-mono text-slate-400 space-y-0.5">
                <div>รหัสบิล: <span class="font-bold text-slate-700">LZ-{{ receiptNo }}</span></div>
                <div class="text-right">งวดวันที่: <span class="font-bold text-slate-700">16 มี.ค. 2569</span></div>
                <div>วันเวลา: <span class="font-bold text-slate-700">{{ receiptTime }}</span></div>
                <div class="text-right">ผู้แทง: <span class="font-bold text-slate-700">VIP MEMBER</span></div>
              </div>
            </div>

            <div class="w-full border-t border-dashed border-slate-300"></div>

            <!-- Bill items list inside receipt -->
            <div class="space-y-1.5 max-h-48 overflow-y-auto py-1">
              @for (item of bets(); track item.id) {
                <div class="flex justify-between items-center text-[11px] font-mono">
                  <div class="flex items-center space-x-1.5">
                    <span class="font-bold text-slate-900 text-xs">{{ item.number }}</span>
                    <span class="text-slate-400">[{{ getTypeName(item.type) }}]</span>
                  </div>
                  <div class="text-slate-800 font-bold">฿{{ item.amount | number }}</div>
                </div>
              }
            </div>

            <div class="w-full border-t border-dashed border-slate-300"></div>

            <!-- Receipt calculation -->
            <div class="space-y-1 text-xs font-bold">
              <div class="flex justify-between text-slate-500 font-mono text-[10px]">
                <span>ยอดรวมดิบ (Gross)</span>
                <span>฿{{ totalAmount() | number }}</span>
              </div>
              <div class="flex justify-between text-emerald-600 font-mono text-[10px]">
                <span>ส่วนลดคู่ค้า (5% Discount)</span>
                <span>-฿{{ discount() | number }}</span>
              </div>
              <div class="flex justify-between text-slate-900 text-sm font-black pt-1">
                <span>ยอดที่ต้องโอนสุทธิ</span>
                <span class="text-emerald-600 font-black">฿{{ netAmount() | number }}</span>
              </div>
            </div>

            <div class="w-full border-t border-dashed border-slate-300"></div>

            <!-- Dynamic PromptPay QR Code generator segment -->
            <div class="text-center space-y-2 pt-1">
              <div class="flex items-center justify-center space-x-2">
                <!-- Promptpay logotype -->
                <span class="bg-indigo-900 text-white px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase">
                  Prompt Pay
                </span>
                <span class="text-[10px] font-bold text-slate-500">แสกน QR ชำระเข้าพร้อมเพย์</span>
              </div>

              <!-- Embed Real-looking QR code using dynamic promptpay.io CDN based on configured ID & total -->
              <div class="flex justify-center">
                <div class="p-2 border border-slate-200 rounded-xl bg-white shadow-xs">
                  <img 
                    [src]="'https://promptpay.io/' + bankInfo.promptpayId + '/' + netAmount() + '.png'"
                    alt="PromptPay QR Code"
                    class="w-36 h-36 mx-auto object-contain"
                    referrerpolicy="no-referrer"
                    onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LOTZENI_OFFLINE'"
                  >
                </div>
              </div>

              <!-- Banking Info Display -->
              <div class="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center space-y-0.5 max-w-xs mx-auto text-[10px]">
                <div class="text-slate-500 font-bold">เลขที่บัญชีสำหรับแจ้งชำระเงิน:</div>
                <div class="font-bold text-slate-900 text-xs">{{ bankInfo.bankName }}</div>
                <div class="font-mono font-black text-indigo-700 text-sm tracking-wider">{{ bankInfo.accountNumber }}</div>
                <div class="font-bold text-slate-700">{{ bankInfo.accountName }}</div>
              </div>
            </div>

            <!-- Footnote edge -->
            <div class="text-center text-[9px] text-slate-400 pt-1 border-t border-dashed border-slate-200 font-mono">
              THANK YOU FOR BETTING WITH LOTZENI
            </div>
            <div class="absolute bottom-0 inset-x-0 h-1 bg-[radial-gradient(circle_at_top,transparent_4px,#e2e8f0_4px)] bg-[length:12px_12px] opacity-70 rotate-180"></div>
          </div>

          <!-- Modal Action footer -->
          <div class="flex gap-2 mt-4">
            <button 
              (click)="copyBillReceiptText()"
              class="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <i class="bi bi-clipboard mr-1.5 text-indigo-600"></i>
              คัดลอกรายละเอียดบิล
            </button>
            <button 
              (click)="printReceiptMockup()"
              class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
            >
              <i class="bi bi-printer mr-1.5"></i>
              พิมพ์ใบโพย / บันทึกภาพ
            </button>
          </div>

        </div>
      </div>
    }

    <!-- SUCCESS MODAL POPUP -->
    @if (isSuccessModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease]">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <i class="bi bi-check-circle-fill text-3xl"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-1">ส่งยอดโพยเข้าหลังบ้านสำเร็จ!</h3>
          <p class="text-xs text-slate-500 mb-6">ระบบคำนวณส่วนลดคู่ค้า ยื่นส่งบันทึกธุรกรรมทางการเงินเรียบร้อยแล้ว</p>
          <button 
            (click)="isSuccessModalOpen.set(false)"
            class="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ตกลง
          </button>
        </div>
      </div>
    }

    <!-- ERROR ALERT POPUP -->
    @if (errorMessage()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-[fade-in_0.2s_ease]">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-center">
          <div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <i class="bi bi-exclamation-octagon-fill text-3xl"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-1">ไม่สามารถดำเนินรายการได้</h3>
          <p class="text-xs text-slate-500 mb-6 font-bold text-rose-600">{{ errorMessage() }}</p>
          <button 
            (click)="errorMessage.set('')"
            class="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ตกลง
          </button>
        </div>
      </div>
    }
  `
})
export class BettingComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  selectedLottery = signal('1');
  activeLotteries = signal([
    { id: '1', name: 'หวยรัฐบาลไทย', flag: '🇹🇭', short: 'TH', period: '16 มีนาคม 2569' },
    { id: '2', name: 'หวยฮานอย (ปกติ)', flag: '🇻🇳', short: 'VN', period: 'วันนี้ 18:00 น.' },
    { id: '3', name: 'หวยลาวพัฒนา', flag: '🇱🇦', short: 'LA', period: 'พรุ่งนี้ 20:00 น.' },
    { id: '4', name: 'หวยมาเลย์', flag: '🇲🇾', short: 'MY', period: '13 มีนาคม 2569' }
  ]);

  getActiveLottery() {
    return this.activeLotteries().find(l => l.id === this.selectedLottery()) || this.activeLotteries()[0];
  }

  getActiveLotteryFlag() {
    return this.getActiveLottery().flag;
  }

  getActiveLotteryShort() {
    return this.getActiveLottery().short;
  }

  getActiveLotteryPeriod() {
    return this.getActiveLottery().period;
  }

  onLotteryChange(val: string) {
    this.selectedLottery.set(val);
  }

  mode = signal<'select' | 'text' | 'ocr'>('select');
  rightTab = signal<'slip' | 'bank'>('slip');
  selectedType = signal('3up');
  
  quickText = '';
  currentNumber = '';
  currentAmount: number | null = null;

  betTypes = [
    { id: '3up', name: '3 ตัวบน', payRate: 900 },
    { id: '3tod', name: '3 ตัวโต๊ด', payRate: 150 },
    { id: '2up', name: '2 ตัวบน', payRate: 90 },
    { id: '2down', name: '2 ตัวล่าง', payRate: 90 },
    { id: 'runup', name: 'วิ่งบน', payRate: 3.2 },
    { id: 'rundown', name: 'วิ่งล่าง', payRate: 4.2 },
  ];

  bets = signal<any[]>([]);
  isSuccessModalOpen = signal(false);
  errorMessage = signal('');

  // PromptPay and banking state persistent across browser session via local storage
  bankInfo = {
    bankName: 'ธนาคารกสิกรไทย',
    accountNumber: '123-4-56789-0',
    accountName: 'บจก. ล็อตเซนิ ประเทศไทย',
    promptpayId: '0812345678'
  };

  // Receipt billing codes
  isReceiptModalOpen = signal(false);
  receiptNo = '';
  receiptTime = '';

  // AI Smart Workspace states
  ocrTextInput = '';
  ocrLoading = signal(false);
  isDragging = signal(false);
  workspaceSearchQuery = '';
  isRandomFilterModalOpen = signal(false);
  randomKeepCount = 10;
  parsedWorkspaceBets = signal<WorkspaceBet[]>([]);

  constructor() {
    this.loadBankInfo();
  }

  loadBankInfo() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lotzeni_bank_info');
      if (saved) {
        try {
          this.bankInfo = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading bank details:', e);
        }
      }
    }
  }

  saveBankInfo() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lotzeni_bank_info', JSON.stringify(this.bankInfo));
      alert('บันทึกรายละเอียดข้อมูลธนาคารและเปิดการเชื่อมต่อคิวอาร์โค้ดพร้อมเพย์เรียบร้อยแล้ว!');
      this.rightTab.set('slip');
    }
  }

  // File drag & drop handling
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onFileDropped(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.processImageFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      this.processImageFile(e.target.files[0]);
    }
  }

  processImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกเฉพาะไฟล์รูปภาพโพยหวย');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const dataUrl = event.target.result;
      const base64Content = dataUrl.split(',')[1];
      const mimeType = file.type;

      this.ocrLoading.set(true);
      this.api.post<any>('betting/ocr-parse', {
        imageBase64: base64Content,
        mimeType: mimeType
      }).subscribe({
        next: (res) => {
          this.ocrLoading.set(false);
          if (res.bets && res.bets.length > 0) {
            const mapped: WorkspaceBet[] = res.bets.map((b: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substring(4),
              number: b.number,
              type: b.type || '3up',
              amount: b.amount || 50,
              selected: true
            }));
            this.parsedWorkspaceBets.set(mapped);
          } else {
            alert('ไม่สามารถอ่านตัวเลขจากโพยภาพได้ กรุณาวางข้อความโพยพิมพ์ด้วยตนเอง');
          }
        },
        error: (err) => {
          this.ocrLoading.set(false);
          const msg = err.error?.message || 'การเรียกใช้ AI ล้มเหลว โปรดตรวจสอบคีย์ API หรือคุณภาพของรูปถ่าย';
          alert(msg);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  triggerTextParsing() {
    if (!this.ocrTextInput.trim()) return;

    this.ocrLoading.set(true);
    this.api.post<any>('betting/ocr-parse', {
      textInput: this.ocrTextInput
    }).subscribe({
      next: (res) => {
        this.ocrLoading.set(false);
        if (res.bets && res.bets.length > 0) {
          const mapped: WorkspaceBet[] = res.bets.map((b: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substring(4),
            number: b.number,
            type: b.type || '3up',
            amount: b.amount || 50,
            selected: true
          }));
          this.parsedWorkspaceBets.set(mapped);
        } else {
          alert('ไม่พบตัวเลขเดิมพันจากข้อความดังกล่าว');
        }
      },
      error: (err) => {
        this.ocrLoading.set(false);
        alert('เกิดข้อผิดพลาดในการประมวลผลข้อความ: ' + (err.error?.message || err.message));
      }
    });
  }

  clearOcrWorkspace() {
    this.parsedWorkspaceBets.set([]);
    this.ocrTextInput = '';
  }

  // Batch analysis helpers
  selectedWorkspaceCount = computed(() => this.parsedWorkspaceBets().filter(b => b.selected).length);
  totalWorkspaceAmount = computed(() => this.parsedWorkspaceBets().filter(b => b.selected).reduce((sum, b) => sum + b.amount, 0));

  hasDuplicates = computed(() => {
    const list = this.parsedWorkspaceBets();
    const keys = new Set<string>();
    for (const b of list) {
      const key = `${b.number}_${b.type}`;
      if (keys.has(key)) return true;
      keys.add(key);
    }
    return false;
  });

  digitFrequencies = computed(() => {
    const freq: { [key: string]: number } = {};
    for (let i = 0; i <= 9; i++) freq[String(i)] = 0;
    
    this.parsedWorkspaceBets().forEach(bet => {
      if (!bet.selected) return;
      const digits = bet.number.split('');
      digits.forEach((d: string) => {
        if (freq[d] !== undefined) freq[d]++;
      });
    });
    
    return Object.entries(freq)
      .map(([digit, count]) => ({ digit, count }))
      .sort((a, b) => b.count - a.count)
      .filter(item => item.count > 0);
  });

  filteredWorkspaceBets = computed(() => {
    const q = this.workspaceSearchQuery.trim().toLowerCase();
    const list = this.parsedWorkspaceBets();
    if (!q) return list;

    return list.filter(b => 
      b.number.includes(q) || 
      this.getTypeName(b.type).toLowerCase().includes(q)
    );
  });

  // Table single-row operations
  removeWorkspaceBet(id: string) {
    this.parsedWorkspaceBets.update(list => list.filter(b => b.id !== id));
  }

  expandRowToReverse(bet: WorkspaceBet) {
    if (bet.number.length !== 2) return;
    const revNum = bet.number.split('').reverse().join('');
    if (revNum === bet.number) return; // same e.g. '55'

    const exists = this.parsedWorkspaceBets().find(b => b.number === revNum && b.type === bet.type);
    if (!exists) {
      this.parsedWorkspaceBets.update(list => [...list, {
        id: Date.now().toString() + Math.random().toString(36).substring(4),
        number: revNum,
        type: bet.type,
        amount: bet.amount,
        selected: true
      }]);
    }
  }

  expandRowTo19Doors(bet: WorkspaceBet) {
    const digit = bet.number.slice(-1); // take the digit
    const numbers: string[] = [];
    
    for (let i = 0; i <= 9; i++) {
      numbers.push(`${digit}${i}`);
      if (String(i) !== digit) {
        numbers.push(`${i}${digit}`);
      }
    }

    const currentList = this.parsedWorkspaceBets();
    const toAdd: WorkspaceBet[] = [];

    numbers.forEach(num => {
      const exists = currentList.find(b => b.number === num && b.type === bet.type);
      if (!exists) {
        toAdd.push({
          id: Date.now().toString() + Math.random().toString(36).substring(4),
          number: num,
          type: bet.type,
          amount: bet.amount,
          selected: true
        });
      }
    });

    if (toAdd.length > 0) {
      this.parsedWorkspaceBets.update(list => [...list, ...toAdd]);
    }
  }

  expandRowTo6Lines(bet: WorkspaceBet) {
    if (bet.number.length !== 3) return;
    
    // Get unique permutations
    const p = bet.number.split('');
    const perms = new Set<string>();
    
    const permute = (arr: string[], m: string[] = []) => {
      if (arr.length === 0) {
        perms.add(m.join(''));
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };
    
    permute(p);

    const currentList = this.parsedWorkspaceBets();
    const toAdd: WorkspaceBet[] = [];

    perms.forEach(num => {
      const exists = currentList.find(b => b.number === num && b.type === bet.type);
      if (!exists) {
        toAdd.push({
          id: Date.now().toString() + Math.random().toString(36).substring(4),
          number: num,
          type: bet.type,
          amount: bet.amount,
          selected: true
        });
      }
    });

    if (toAdd.length > 0) {
      this.parsedWorkspaceBets.update(list => [...list, ...toAdd]);
    }
  }

  toggleSelectAllWorkspace() {
    const list = this.parsedWorkspaceBets();
    const allSelected = list.every(b => b.selected);
    this.parsedWorkspaceBets.update(current => current.map(b => ({ ...b, selected: !allSelected })));
  }

  consolidateDuplicates() {
    const merged: { [key: string]: WorkspaceBet } = {};
    
    this.parsedWorkspaceBets().forEach(bet => {
      const key = `${bet.number}_${bet.type}`;
      if (merged[key]) {
        merged[key].amount += bet.amount;
      } else {
        merged[key] = { ...bet };
      }
    });

    this.parsedWorkspaceBets.set(Object.values(merged));
  }

  toggleRandomFilterModal() {
    this.randomKeepCount = Math.min(this.parsedWorkspaceBets().length, 10);
    this.isRandomFilterModalOpen.update(v => !v);
  }

  applyQuickFilter(count: number) {
    this.randomKeepCount = Math.min(this.parsedWorkspaceBets().length, count);
  }

  triggerRandomKeep() {
    const list = [...this.parsedWorkspaceBets()];
    if (list.length === 0) return;

    // Shuffle array element order in-place
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    // Assign 'selected' property to exactly randomKeepCount items
    const keepIds = new Set(list.slice(0, this.randomKeepCount).map(b => b.id));
    
    this.parsedWorkspaceBets.update(current => 
      current.map(b => ({
        ...b,
        selected: keepIds.has(b.id)
      }))
    );

    this.isRandomFilterModalOpen.set(false);
  }

  importSelectedToMainSlip() {
    const selected = this.parsedWorkspaceBets().filter(b => b.selected);
    if (selected.length === 0) return;

    const mapped = selected.map(item => {
      const rate = this.betTypes.find(t => t.id === item.type)?.payRate || 90;
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(4),
        number: item.number,
        type: item.type,
        amount: item.amount,
        payRate: rate
      };
    });

    this.bets.update(current => [...current, ...mapped]);
    
    // De-select the imported items in workspace
    this.parsedWorkspaceBets.update(current => 
      current.map(item => item.selected ? { ...item, selected: false } : item)
    );

    alert(`เพิ่มยอดจำนวน ${selected.length} รายการลงในใบโพยหลักเรียบร้อยแล้ว!`);
  }

  // MAIN BET ACTIONS
  totalAmount = computed(() => this.bets().reduce((sum, bet) => sum + bet.amount, 0));
  discount = computed(() => this.totalAmount() * 0.05);
  netAmount = computed(() => this.totalAmount() - this.discount());

  getTypeName(id: string) {
    return this.betTypes.find(t => t.id === id)?.name || id;
  }

  appendNumber(n: string) {
    if (this.currentNumber.length < 3) {
      this.currentNumber += n;
    }
  }

  clearNumber() {
    this.currentNumber = this.currentNumber.slice(0, -1);
  }

  addBet() {
    if (!this.currentNumber || !this.currentAmount || this.currentAmount <= 0) return;

    const type = this.betTypes.find(t => t.id === this.selectedType());
    if (!type) return;

    this.bets.update(b => [...b, {
      id: Date.now().toString() + Math.random(),
      number: this.currentNumber,
      type: type.id,
      amount: this.currentAmount,
      payRate: type.payRate
    }]);

    this.currentNumber = '';
    this.currentAmount = null;
  }

  removeBet(id: string) {
    this.bets.update(b => b.filter(bet => bet.id !== id));
  }

  clearAll() {
    this.bets.set([]);
  }

  submitBets() {
    const list = this.bets();
    if (list.length === 0) return;

    const currentUser = this.auth.currentUser();
    const payload = {
      betsList: list,
      userId: currentUser?.id,
      username: currentUser?.username,
      lottoName: this.getActiveLottery().name
    };

    this.api.post<any>('bets', payload).subscribe({
      next: (res) => {
        this.clearAll();
        if (res.balance !== undefined) {
          this.auth.updateUserBalance(res.balance);
        }
        this.isSuccessModalOpen.set(true);
      },
      error: (err) => {
        const msg = err.error?.message || 'การแทงล้มเหลว กรุณาตรวจสอบวงเงินเครดิตของท่าน';
        this.errorMessage.set(msg);
      }
    });
  }

  parseQuickText() {
    if (!this.quickText.trim()) return;
    
    const lines = this.quickText.split('\n');
    const newBets: any[] = [];

    lines.forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const num = parts[0].trim();
        const amt1 = parseInt(parts[1].trim());
        
        if (num.length === 3) {
          if (amt1 > 0) {
            newBets.push({
              id: Date.now().toString() + Math.random(),
              number: num,
              type: '3up',
              amount: amt1,
              payRate: 900
            });
          }
          if (parts.length === 3) {
            const amt2 = parseInt(parts[2].trim());
            if (amt2 > 0) {
              newBets.push({
                id: Date.now().toString() + Math.random(),
                number: num,
                type: '3tod',
                amount: amt2,
                payRate: 150
              });
            }
          }
        } else if (num.length === 2) {
          if (amt1 > 0) {
            newBets.push({
              id: Date.now().toString() + Math.random(),
              number: num,
              type: '2up',
              amount: amt1,
              payRate: 90
            });
          }
          if (parts.length === 3) {
            const amt2 = parseInt(parts[2].trim());
            if (amt2 > 0) {
              newBets.push({
                id: Date.now().toString() + Math.random(),
                number: num,
                type: '2down',
                amount: amt2,
                payRate: 90
              });
            }
          }
        }
      }
    });

    if (newBets.length > 0) {
      this.bets.update(b => [...b, ...newBets]);
      this.quickText = '';
      alert(`คีย์ด่วนผ่านข้อความสำเร็จ เพิ่มเข้าไป ${newBets.length} รายการ!`);
    }
  }

  // Receipt billing exports
  openReceiptModal() {
    this.receiptNo = Math.floor(100000 + Math.random() * 900000).toString();
    this.receiptTime = new Date().toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
    this.isReceiptModalOpen.set(true);
  }

  copyBillReceiptText() {
    let t = `=== LOTZENI BILL LZ-${this.receiptNo} ===\n`;
    t += `งวด: 16 มี.ค. 2569 | เวลา: ${this.receiptTime}\n`;
    t += `--------------------------------------\n`;
    this.bets().forEach((bet, idx) => {
      t += `${idx+1}. เลข ${bet.number} [${this.getTypeName(bet.type)}] x ฿${bet.amount}\n`;
    });
    t += `--------------------------------------\n`;
    t += `ยอดโอนรวม: ฿${this.netAmount().toLocaleString()} บาท\n`;
    t += `รับโอนที่: ${this.bankInfo.bankName} ${this.bankInfo.accountNumber}\n`;
    t += `ชื่อบัญชี: ${this.bankInfo.accountName}\n`;
    t += `พร้อมเพย์: ${this.bankInfo.promptpayId}\n`;
    t += `======================================`;

    navigator.clipboard.writeText(t).then(() => {
      alert('คัดลอกรายละเอียดบิลโพยไปยังคลิปบอร์ดแล้ว!');
    });
  }

  printReceiptMockup() {
    window.print();
  }

  exportToCSV() {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "ลำดับ,ตัวเลข,ประเภท,ราคาเดิมพัน (บาท),อัตราจ่าย\n";
    this.bets().forEach((bet, idx) => {
      csvContent += `${idx + 1},'${bet.number},${this.getTypeName(bet.type)},${bet.amount},x${bet.payRate}\n`;
    });
    csvContent += `\n,,,ยอดรวมสุทธิ,${this.netAmount()}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `บิลโพย_LOTZENI_${this.receiptNo || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
