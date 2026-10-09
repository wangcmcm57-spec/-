// =========================================================================
// 抠门公审堂 (Stingy Master Court) - 核心业务与交互逻辑系统
// 主打购买申请与好友公审把关，含身份授权、实时进度流、状态同步与声学动效
// =========================================================================

const STORAGE_KEYS = {
  USER: 'stingy_current_user_v2',
  MY_APPS: 'stingy_my_applications_v2',
  PENDING_FOR_ME: 'stingy_pending_for_me_v2',
  REVIEWED_HISTORY: 'stingy_reviewed_history_v2',
  LATEST_NOTIF: 'stingy_latest_notification_v2'
};

// 预设测试身份库 (方便单人体验完整公审闭环)
const PRESET_IDENTITIES = {
  self: {
    id: 'u_self',
    nickname: '理智管家阿强',
    avatar: '/assets/loewe_tomato_banner.jpg',
    tag: '理智把关人',
    authorized: true
  },
  xiaomei: {
    id: 'u_xiaomei',
    nickname: '好友小美',
    avatar: '/assets/loewe_stats_cactus.jpg',
    tag: '理性劝退师',
    authorized: true
  },
  daming: {
    id: 'u_daming',
    nickname: '好友大明',
    avatar: '/assets/loewe_rank_lemon.jpg',
    tag: '刚需裁判官',
    authorized: true
  }
};

// 默认初始数据 (真实生动，展现完整公审闭环)
const DEFAULT_MY_APPLICATIONS = [
  {
    id: 'app_my_101',
    item: '降噪无线蓝牙耳机',
    cost: 799.00,
    reason: '办公室偶尔有点嘈杂，想买个头戴式降噪让自己专注点...',
    applicantName: '理智管家阿强',
    applicantAvatar: '/assets/loewe_tomato_banner.jpg',
    status: 'rejected', // 'pending' | 'rejected' | 'approved'
    reviewerName: '好友小美',
    reviewerAvatar: '/assets/loewe_stats_cactus.jpg',
    reviewerOpinion: '你抽屉里已经有两条有线耳机了，买回来又是戴两次吃灰，坚决驳回！帮你省下800块！',
    time: '15分钟前',
    timestamp: Date.now() - 15 * 60 * 1000
  },
  {
    id: 'app_my_102',
    item: '人体工学护腰靠垫',
    cost: 128.00,
    reason: '最近久坐码字腰有点酸，想买个靠垫支撑一下。',
    applicantName: '理智管家阿强',
    applicantAvatar: '/assets/loewe_tomato_banner.jpg',
    status: 'approved',
    reviewerName: '好友大明',
    reviewerAvatar: '/assets/loewe_rank_lemon.jpg',
    reviewerOpinion: '身体健康是最大的刚需，这个不属于冲动消费，已准奏！',
    time: '2小时前',
    timestamp: Date.now() - 2 * 3600 * 1000
  }
];

const DEFAULT_PENDING_FOR_ME = [
  {
    id: 'case_friend_201',
    item: '大牌草本香薰蜡烛',
    cost: 380.00,
    reason: '周末想营造一点松弛感，这个草本香味特别高级...',
    applicantName: '好友小美',
    applicantAvatar: '/assets/loewe_stats_cactus.jpg',
    time: '10分钟前',
    timestamp: Date.now() - 10 * 60 * 1000
  },
  {
    id: 'case_friend_202',
    item: '限定款复古黑胶唱片机',
    cost: 699.00,
    reason: '被博主种草了，摆在客厅特别有复古氛围感...',
    applicantName: '好友大明',
    applicantAvatar: '/assets/loewe_rank_lemon.jpg',
    time: '35分钟前',
    timestamp: Date.now() - 35 * 60 * 1000
  }
];

const DEFAULT_REVIEWED_HISTORY = [
  {
    id: 'case_friend_301',
    item: '电竞幻彩RGB鼠标垫',
    cost: 168.00,
    reason: '发光好看，打游戏更有手感',
    applicantName: '好友阿飞',
    applicantAvatar: '/assets/loewe_profile_cherub.jpg',
    status: 'rejected',
    reviewerName: '理智管家阿强',
    reviewerAvatar: '/assets/loewe_tomato_banner.jpg',
    reviewerOpinion: '十块钱的普通黑鼠标垫一样精准，光污染费电又伤眼，驳回！',
    time: '昨天',
    timestamp: Date.now() - 86400 * 1000
  }
];

const DEFAULT_LATEST_NOTIF = {
  show: true,
  appId: 'app_my_101',
  applicantItem: '降噪无线蓝牙耳机',
  cost: 799.00,
  status: 'rejected',
  reviewerName: '好友小美',
  reviewerAvatar: '/assets/loewe_stats_cactus.jpg',
  reviewerOpinion: '你抽屉里已经有两条有线耳机了，买回来又是戴两次吃灰，坚决驳回！帮你省下800块！',
  time: '刚刚'
};

// 响应式内存状态
let currentUser = null;
let myApplications = [];
let pendingForMe = [];
let reviewedHistory = [];
let latestNotification = null;

let currentTab = 'home';
let currentApprovalsSubTab = 'my';
let currentReviewCaseId = null;
let pendingDecisionData = null;
let selectedTempAvatar = '/assets/loewe_tomato_banner.jpg';
let currentShareCase = { id: '', item: '', cost: '', reason: '' };

// ==================== 初始化与存储同步 ====================
function loadStateFromStorage() {
  try {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    currentUser = u ? JSON.parse(u) : { ...PRESET_IDENTITIES.self, authorized: true };

    const myApps = localStorage.getItem(STORAGE_KEYS.MY_APPS);
    myApplications = myApps ? JSON.parse(myApps) : [...DEFAULT_MY_APPLICATIONS];

    const pending = localStorage.getItem(STORAGE_KEYS.PENDING_FOR_ME);
    pendingForMe = pending ? JSON.parse(pending) : [...DEFAULT_PENDING_FOR_ME];

    const history = localStorage.getItem(STORAGE_KEYS.REVIEWED_HISTORY);
    reviewedHistory = history ? JSON.parse(history) : [...DEFAULT_REVIEWED_HISTORY];

    const notif = localStorage.getItem(STORAGE_KEYS.LATEST_NOTIF);
    latestNotification = notif ? JSON.parse(notif) : { ...DEFAULT_LATEST_NOTIF };
  } catch (e) {
    console.warn('LocalStorage error, using defaults', e);
    currentUser = { ...PRESET_IDENTITIES.self, authorized: false };
    myApplications = [...DEFAULT_MY_APPLICATIONS];
    pendingForMe = [...DEFAULT_PENDING_FOR_ME];
    reviewedHistory = [...DEFAULT_REVIEWED_HISTORY];
    latestNotification = { ...DEFAULT_LATEST_NOTIF };
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.MY_APPS, JSON.stringify(myApplications));
    localStorage.setItem(STORAGE_KEYS.PENDING_FOR_ME, JSON.stringify(pendingForMe));
    localStorage.setItem(STORAGE_KEYS.REVIEWED_HISTORY, JSON.stringify(reviewedHistory));
    if (latestNotification) {
      localStorage.setItem(STORAGE_KEYS.LATEST_NOTIF, JSON.stringify(latestNotification));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LATEST_NOTIF);
    }
  } catch (e) {
    console.warn('Save localStorage error:', e);
  }
}

// ==================== 页面切页与 Tab 切换 ====================
function navigateTab(tabKey) {
  currentTab = tabKey;
  
  document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('text-[#1C2621]');
    btn.classList.add('text-[#707D76]');
  });

  const targetView = document.getElementById(`view-${tabKey}`);
  const targetNav = document.getElementById(`nav-${tabKey}`);

  if (targetView) targetView.classList.remove('hidden');
  if (targetNav) {
    targetNav.classList.remove('text-[#707D76]');
    targetNav.classList.add('text-[#1C2621]');
  }

  renderAll();
}

function switchApprovalsTab(subTab) {
  currentApprovalsSubTab = subTab;
  const btnMy = document.getElementById('approvals-tab-my');
  const btnForMe = document.getElementById('approvals-tab-for-me');
  const contentMy = document.getElementById('approvals-content-my');
  const contentForMe = document.getElementById('approvals-content-for-me');

  if (subTab === 'my') {
    if (btnMy) btnMy.className = "flex-1 py-2 rounded-full text-xs font-bold transition-all bg-[#FAF7F2] text-[#1C2621] shadow-xs border border-[#EADBCA] flex items-center justify-center gap-1.5";
    if (btnForMe) btnForMe.className = "flex-1 py-2 rounded-full text-xs font-bold transition-all text-[#707D76] flex items-center justify-center gap-1.5";
    if (contentMy) contentMy.classList.remove('hidden');
    if (contentForMe) contentForMe.classList.add('hidden');
  } else {
    if (btnForMe) btnForMe.className = "flex-1 py-2 rounded-full text-xs font-bold transition-all bg-[#FAF7F2] text-[#1C2621] shadow-xs border border-[#EADBCA] flex items-center justify-center gap-1.5";
    if (btnMy) btnMy.className = "flex-1 py-2 rounded-full text-xs font-bold transition-all text-[#707D76] flex items-center justify-center gap-1.5";
    if (contentForMe) contentForMe.classList.remove('hidden');
    if (contentMy) contentMy.classList.add('hidden');
  }

  renderApprovals();
}

// ==================== 渲染引擎 (Render Views) ====================
function renderAll() {
  renderHome();
  renderStats();
  renderApprovals();
  renderProfile();
}

// 1. 首页渲染
function renderHome() {
  const headerAvatar = document.getElementById('home-header-avatar');
  const headerName = document.getElementById('home-header-name');
  if (headerAvatar) headerAvatar.src = currentUser.avatar;
  if (headerName) headerName.innerText = currentUser.nickname;

  const dateTag = document.getElementById('home-today-date-tag');
  if (dateTag) {
    const now = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    dateTag.innerText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${days[now.getDay()]}`;
  }

  // 最新审批提醒横幅 (Approval Notification Banner)
  const alertContainer = document.getElementById('home-latest-alert-card');
  if (alertContainer) {
    if (latestNotification && latestNotification.show) {
      alertContainer.classList.remove('hidden');
      const isReject = latestNotification.status === 'rejected';
      alertContainer.innerHTML = `
          <div class="${isReject ? 'bg-[#FAF2F0] border-[#F6DCD8]' : 'bg-[#F0F5F2] border-[#DCE8E1]'} rounded-[24px] p-4 border shadow-sm relative overflow-hidden transition-all">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs ${isReject ? 'bg-[#A84A38]' : 'bg-[#3C624B]'} text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                <span>${isReject ? '🛡️ 好友已劝阻驳回' : '✅ 好友已批准放行'}</span>
              </span>
              <span class="text-[10px] text-[#707D76]">${latestNotification.time || '刚刚'}</span>
            </div>
            <button onclick="closeHomeAlertNotification()" class="w-6 h-6 rounded-full bg-white/80 border border-[#EADBCA] flex items-center justify-center text-[#707D76] text-xs hover:bg-white transition-colors" title="关闭提醒">
              ✕
            </button>
          </div>

          <div class="flex items-center gap-3 my-2">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-[#EADBCA] bg-white shrink-0 shadow-2xs">
              <img src="${latestNotification.reviewerAvatar || '/assets/loewe_stats_cactus.jpg'}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-[#1C2621]">
                好友 <span class="text-[#A67E48]">${latestNotification.reviewerName}</span> ${isReject ? '驳回了你的申请' : '批准了你的申请'}
              </p>
              <p class="text-[11px] text-[#707D76] truncate">
                物品：<strong class="text-[#1C2621] font-bold">${latestNotification.applicantItem}</strong> · 金额：<span class="font-din font-black text-[#1C2621]">¥${parseFloat(latestNotification.cost).toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div class="bg-white/85 rounded-xl p-2.5 border border-[#EADBCA]/70 text-[11px] text-[#1C2621] leading-relaxed">
            <span class="font-bold text-[#8C6D40]">好友评语：</span>“${latestNotification.reviewerOpinion || '坚决帮你守住钱袋！'}”
          </div>

          <div class="mt-2.5 flex items-center justify-between">
            <span class="text-[10px] text-[#707D76]">
              ${isReject ? '✓ 成功拦截一笔冲动，已自动记入理智金库' : '✓ 属于刚需支出，请按计划消费'}
            </span>
            <button onclick="openCaseDetailModal('${latestNotification.appId || 'app_my_101'}', 'my')" class="text-[10px] font-bold ${isReject ? 'text-[#A84A38]' : 'text-[#3C624B]'} hover:underline flex items-center gap-0.5">
              <span>查看完整裁决书</span>
              <span>›</span>
            </button>
          </div>
        </div>
      `;
    } else {
      alertContainer.classList.add('hidden');
      alertContainer.innerHTML = '';
    }
  }

  // 金库总金额计算 (以被劝阻拦截的金额为准)
  let totalBlocked = 0;
  let blockedCount = 0;
  myApplications.forEach(app => {
    if (app.status === 'rejected') {
      totalBlocked += parseFloat(app.cost || 0);
      blockedCount += 1;
    }
  });
  const displayTotal = totalBlocked + 1699.00;
  const displayCount = blockedCount + 3;

  const savedEl = document.getElementById('home-saved-display');
  const blockedEl = document.getElementById('home-blocked-display');
  if (savedEl) savedEl.innerText = displayTotal.toFixed(2);
  if (blockedEl) blockedEl.innerText = `已成功劝阻驳回 ${displayCount} 笔冲动消费`;

  // 专区 1：待我审批 (Pending Approvals for Me)
  const pendingBadge = document.getElementById('home-pending-badge');
  const pendingList = document.getElementById('home-pending-list');

  if (pendingBadge) {
    if (pendingForMe.length > 0) {
      pendingBadge.innerText = `${pendingForMe.length} 笔待处理`;
      pendingBadge.className = "text-[10px] bg-[#181D1B] text-white px-2 py-0.5 rounded-full font-bold shadow-xs";
    } else {
      pendingBadge.innerText = '已全部处理';
      pendingBadge.className = "text-[10px] bg-[#FAF5ED] text-[#345942] px-2 py-0.5 rounded-full font-bold border border-[#D5E8DC]";
    }
  }

  if (pendingList) {
    if (pendingForMe.length === 0) {
      pendingList.innerHTML = `
        <div class="bg-[#FFFFFF] rounded-2xl p-4 border border-[#F3EDE2] text-center shadow-xs">
          <div class="text-2xl mb-1">🎉</div>
          <p class="text-xs font-bold text-[#1C2621]">太棒了！暂无待处理的好友审批</p>
          <p class="text-[10px] text-[#707D76] mt-0.5">好友的每一笔购物冲动都已妥善把关，理智金库天下太平</p>
        </div>
      `;
    } else {
      pendingList.innerHTML = pendingForMe.map(c => `
        <div class="bg-[#FFFFFF] rounded-2xl p-3.5 border border-[#F3EDE2] shadow-subtleCard flex items-center justify-between gap-3 hover:border-[#EADBCA] transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-[#EADBCA] bg-[#FAF5ED] shrink-0">
              <img src="${c.applicantAvatar}" alt="${c.applicantName}" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-[#1C2621] truncate">${c.applicantName}</span>
                <span class="text-[9px] text-[#A67E48] bg-[#FAF5ED] px-1.5 py-0.2 rounded border border-[#EADBCA] shrink-0">求把关</span>
              </div>
              <p class="text-xs text-[#707D76] mt-0.5 truncate">
                想买：<strong class="text-[#1C2621]">${c.item}</strong>
              </p>
              <p class="text-[10px] text-[#8C6D40] mt-0.5 italic truncate">
                “${c.reason}”
              </p>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="font-din text-sm font-bold text-[#1C2621] block">¥${parseFloat(c.cost).toFixed(2)}</span>
            <button onclick="openCourtCaseModal('${c.id}')" class="mt-1 text-[11px] font-bold text-white bg-[#181D1B] hover:bg-[#2A312F] px-3 py-1 rounded-full shadow-xs active:scale-95 transition-transform">
              立即审批
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // 专区 2：我发起的购买申请 · 实时进度 (My Applications Stream)
  const myAppsList = document.getElementById('home-my-applications-list');
  if (myAppsList) {
    if (myApplications.length === 0) {
      myAppsList.innerHTML = `
        <div class="bg-[#FFFFFF] rounded-2xl p-4 border border-[#F3EDE2] text-center shadow-xs">
          <p class="text-xs text-[#707D76]">你还没有发起过购买申请</p>
          <button onclick="openApplyModal()" class="mt-2 text-xs font-bold text-[#1C2621] bg-[#FAF5ED] px-3 py-1 rounded-full border border-[#EADBCA]">
            + 立即发起第一笔想买
          </button>
        </div>
      `;
    } else {
      myAppsList.innerHTML = myApplications.map(app => {
        const isPending = app.status === 'pending';
        const isReject = app.status === 'rejected';

        let statusTag = '';
        if (isPending) {
          statusTag = `<span class="text-[9px] text-[#A67E48] bg-[#FAF5ED] px-2 py-0.5 rounded-full border border-[#EADBCA] font-bold">⏳ 审批中 · 待好友投票</span>`;
        } else if (isReject) {
          statusTag = `<span class="text-[9px] text-[#A84A38] bg-[#FAF5ED] px-2 py-0.5 rounded-full border border-[#EADBCA] font-bold">🛡️ 已驳回 · 守住金库</span>`;
        } else {
          statusTag = `<span class="text-[9px] text-[#345942] bg-[#EBF4EE] px-2 py-0.5 rounded-full border border-[#D5E8DC] font-bold">✅ 已批准 · 允许购买</span>`;
        }

        return `
          <div onclick="openCaseDetailModal('${app.id}', 'my')" class="bg-[#FFFFFF] rounded-2xl p-3.5 border border-[#F3EDE2] shadow-subtleCard hover:border-[#EADBCA] cursor-pointer transition-colors">
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="min-w-0 flex-1">
                <h4 class="text-xs font-bold text-[#1C2621] truncate">
                  ${app.item}
                </h4>
                <p class="text-[10px] text-[#707D76] mt-0.5 truncate">申请自述：“${app.reason}”</p>
              </div>
              <div class="text-right shrink-0 flex flex-col items-end">
                <span class="font-din text-sm font-black text-[#1C2621]">
                  ¥${parseFloat(app.cost).toFixed(2)}
                </span>
                <div class="mt-1 flex justify-end">
                  ${statusTag}
                </div>
              </div>
            </div>

            ${!isPending ? `
              <div class="mt-2 pt-2 border-t border-[#F7F2E9] flex items-center justify-between text-[10px]">
                <div class="flex items-center gap-1.5">
                  <img src="${app.reviewerAvatar || '/assets/loewe_tomato_banner.jpg'}" class="w-4 h-4 rounded-full object-cover border border-[#EADBCA]">
                  <span class="text-[#707D76]">审批好友：<strong class="text-[#1C2621]">${app.reviewerName}</strong></span>
                </div>
                <span class="text-[#A67E48] font-bold truncate max-w-[170px]">
                  评语：“${app.reviewerOpinion}”
                </span>
              </div>
            ` : `
              <div class="mt-2 pt-2 border-t border-[#F7F2E9] flex items-center justify-between text-[10px] text-[#707D76]">
                <span>等待微信好友把关审批...</span>
                <button onclick="event.stopPropagation(); openShareApprovalModal('${app.item}', '${parseFloat(app.cost).toFixed(2)}', '${app.reason}', '${app.id}')" class="text-[10px] font-bold text-[#8C6D40] hover:underline">
                  再次分享好友 ›
                </button>
              </div>
            `}
          </div>
        `;
      }).join('');
    }
  }
}

// 2. 统计页渲染
// 日历状态管理 (默认当前 2026 年 10 月)
let calendarCurrentYear = 2026;
let calendarCurrentMonth = 9; // 0-indexed: 9 表示 10月
let selectedCalendarDay = 9;  // 默认选中 10月9日

function prevCalendarMonth() {
  calendarCurrentMonth -= 1;
  if (calendarCurrentMonth < 0) {
    calendarCurrentMonth = 11;
    calendarCurrentYear -= 1;
  }
  renderStats();
}

function nextCalendarMonth() {
  calendarCurrentMonth += 1;
  if (calendarCurrentMonth > 11) {
    calendarCurrentMonth = 0;
    calendarCurrentYear += 1;
  }
  renderStats();
}

function selectCalendarDay(day, hasBlocked, hasApproved, count) {
  selectedCalendarDay = day;
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const titleEl = document.getElementById('cday-date-title');
  const badgeEl = document.getElementById('cday-badge');
  const descEl = document.getElementById('cday-desc');

  if (titleEl) {
    titleEl.innerText = `${monthNames[calendarCurrentMonth]}${day}日 · 理智战报`;
  }

  if (hasBlocked) {
    if (badgeEl) {
      badgeEl.className = "text-[9px] text-[#345942] bg-[#EBF4EE] px-2 py-0.5 rounded-full border border-[#D5E8DC] font-bold";
      badgeEl.innerText = "成功劝阻 · 守住金库";
    }
    if (descEl) {
      descEl.innerText = `当日好友客观否决了不合理购买诉求，成功守住冲动消费预算；理智自律+1天！`;
    }
  } else if (hasApproved) {
    if (badgeEl) {
      badgeEl.className = "text-[9px] text-[#8C6D40] bg-[#FAF5ED] px-2 py-0.5 rounded-full border border-[#EADBCA] font-bold";
      badgeEl.innerText = "核准刚需 · 理性放行";
    }
    if (descEl) {
      descEl.innerText = `当日审批确认属于生活/工作必需品，好友合议核准放行。`;
    }
  } else {
    if (badgeEl) {
      badgeEl.className = "text-[9px] text-[#707D76] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EADBCA] font-bold";
      badgeEl.innerText = "心如止水 · 零冲动";
    }
    if (descEl) {
      descEl.innerText = `当日无物欲波澜与多余购买申请，平淡充实，恪守理性。`;
    }
  }

  // 重新高亮选中的日期单元格
  renderStatsCalendarGrid();
}

function renderStatsCalendarGrid() {
  const gridEl = document.getElementById('stats-calendar-grid');
  const monthLabelEl = document.getElementById('calendar-month-label');
  const summaryEl = document.getElementById('calendar-summary-stat');
  if (!gridEl) return;

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  if (monthLabelEl) {
    monthLabelEl.innerText = `${calendarCurrentYear}年${monthNames[calendarCurrentMonth]}`;
  }

  // 计算本月第一天是周几以及总天数
  const firstDayOfWeek = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay(); // 0 is Sun
  // 转换成周一开始: 周一=0, 周日=6
  const startOffset = (firstDayOfWeek + 6) % 7;
  const daysInMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();

  // 根据当前实际数据生成打卡分布 (10月份有4笔劝阻，1笔放行)
  const isTargetMonth = (calendarCurrentYear === 2026 && calendarCurrentMonth === 9);
  const blockedDays = isTargetMonth ? [3, 6, 8, 9] : [5, 12, 19];
  const approvedDays = isTargetMonth ? [4, 7] : [10];

  let totalDisciplinedDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (d <= (isTargetMonth ? 9 : daysInMonth)) {
      totalDisciplinedDays++;
    }
  }

  if (summaryEl) {
    summaryEl.innerText = `本月自律天数 ${totalDisciplinedDays} 天`;
  }

  let html = '';
  // 填充月初空白
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="h-9 rounded-xl border border-transparent"></div>`;
  }

  // 填充每一天
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = (day === selectedCalendarDay);
    const hasBlocked = blockedDays.includes(day);
    const hasApproved = approvedDays.includes(day);
    const isToday = isTargetMonth && (day === 9);

    let bgClass = "bg-[#FAF7F2] text-[#1C2621] border-[#EADBCA]/60";
    let dotClass = "";

    if (isSelected) {
      bgClass = "bg-[#181D1B] text-white border-[#181D1B] shadow-xs scale-105 z-10";
    } else if (hasBlocked) {
      bgClass = "bg-[#EBF4EE] text-[#2E5339] border-[#D5E8DC] font-bold";
    } else if (hasApproved) {
      bgClass = "bg-[#FAF5ED] text-[#8C6D40] border-[#EADBCA] font-medium";
    }

    if (hasBlocked) {
      dotClass = `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#78B391]' : 'bg-[#345942]'} block"></span>`;
    } else if (hasApproved) {
      dotClass = `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#EADBCA]' : 'bg-[#8C6D40]'} block"></span>`;
    }

    html += `
      <div onclick="selectCalendarDay(${day}, ${hasBlocked}, ${hasApproved})" class="h-9 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${bgClass} active:scale-95 relative">
        <span class="text-[11px] leading-none ${isToday && !isSelected ? 'font-black text-[#A84A38]' : ''}">${day}</span>
        ${dotClass ? `<div class="mt-0.5 flex gap-0.5">${dotClass}</div>` : ''}
      </div>
    `;
  }

  gridEl.innerHTML = html;
}

// 2. 统计页渲染 (按最早之前来，增加日历统计，移除审批裁决历史账本)
function renderStats() {
  let totalBlocked = 0;
  let totalApproved = 0;
  let totalApplied = 0;
  let countBlocked = 0;
  let countApproved = 0;

  myApplications.forEach(app => {
    const cost = parseFloat(app.cost || 0);
    totalApplied += cost;
    if (app.status === 'rejected') {
      totalBlocked += cost;
      countBlocked += 1;
    } else if (app.status === 'approved') {
      totalApproved += cost;
      countApproved += 1;
    }
  });

  const statBlocked = totalBlocked + 1699.00;
  const statApplied = totalApplied + 2079.00;
  const rate = statApplied > 0 ? ((statBlocked / statApplied) * 100).toFixed(1) : '85.2';

  const blockedDisplay = document.getElementById('stats-blocked-amount-display');
  const appliedDisplay = document.getElementById('stats-total-applied');
  const rateBadge = document.getElementById('stats-rate-badge');
  const countBlockedEl = document.getElementById('stats-count-blocked');
  const countApprovedEl = document.getElementById('stats-count-approved');
  const friendSavedEl = document.getElementById('stats-friend-saved');
  const totalCasesEl = document.getElementById('stats-total-cases');

  if (blockedDisplay) blockedDisplay.innerText = `¥${statBlocked.toFixed(2)}`;
  if (appliedDisplay) appliedDisplay.innerText = `¥${statApplied.toFixed(2)}`;
  if (rateBadge) rateBadge.innerText = `${rate}%`;
  if (countBlockedEl) countBlockedEl.innerText = `${countBlocked + 3}`;
  if (countApprovedEl) countApprovedEl.innerText = `${countApproved + 1}`;
  if (friendSavedEl) friendSavedEl.innerText = `¥1,087.00`;
  if (totalCasesEl) totalCasesEl.innerText = `${countBlocked + countApproved + reviewedHistory.length + 4}`;

  // 渲染自律日历打卡网格
  renderStatsCalendarGrid();
}

// 3. 抠门审批页渲染
function renderApprovals() {
  const tabBadgeMy = document.getElementById('tab-badge-my');
  const tabBadgeForMe = document.getElementById('tab-badge-for-me');
  const navPendingBadge = document.getElementById('nav-pending-badge');
  const pendingCountTag = document.getElementById('approvals-pending-count-tag');

  if (tabBadgeMy) tabBadgeMy.innerText = myApplications.length;
  if (tabBadgeForMe) tabBadgeForMe.innerText = pendingForMe.length;
  if (pendingCountTag) pendingCountTag.innerText = `${pendingForMe.length} 笔待审`;

  if (navPendingBadge) {
    if (pendingForMe.length > 0) {
      navPendingBadge.innerText = pendingForMe.length;
      navPendingBadge.classList.remove('hidden');
    } else {
      navPendingBadge.classList.add('hidden');
    }
  }

  // 分栏 1：我发起的列表
  const myList = document.getElementById('approvals-my-list');
  if (myList) {
    if (myApplications.length === 0) {
      myList.innerHTML = `<div class="bg-white rounded-2xl p-5 text-center text-xs text-[#707D76] border border-[#F3EDE2]">暂无申请记录</div>`;
    } else {
      myList.innerHTML = myApplications.map(app => {
        const isPending = app.status === 'pending';
        const isReject = app.status === 'rejected';

        return `
          <div onclick="openCaseDetailModal('${app.id}', 'my')" class="bg-white rounded-2xl p-4 border border-[#F3EDE2] shadow-xs hover:border-[#EADBCA] cursor-pointer transition-all">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="text-sm font-bold text-[#1C2621]">${app.item}</h3>
                <p class="text-xs text-[#707D76] mt-0.5">申请自述：“${app.reason}”</p>
              </div>
              <div class="text-right">
                <span class="font-din text-base font-black text-[#1C2621]">
                  ¥${parseFloat(app.cost).toFixed(2)}
                </span>
                <span class="text-[10px] text-[#707D76] block mt-0.5">${app.time}</span>
              </div>
            </div>

            <div class="pt-2.5 border-t border-[#F5EFE4] flex items-center justify-between text-xs">
              ${isPending ? `
                <span class="text-[10px] text-[#A67E48] bg-[#FAF5ED] px-2 py-0.5 rounded-full border border-[#EADBCA] font-bold">
                  ⏳ 审批中 · 等待好友裁决
                </span>
                <button onclick="event.stopPropagation(); openShareApprovalModal('${app.item}', '${parseFloat(app.cost).toFixed(2)}', '${app.reason}', '${app.id}')" class="text-[10px] font-bold text-[#8C6D40] hover:underline">
                  邀请好友投票 ›
                </button>
              ` : `
                <div class="flex items-center gap-1.5">
                  <img src="${app.reviewerAvatar || '/assets/loewe_tomato_banner.jpg'}" class="w-4 h-4 rounded-full object-cover border border-[#EADBCA]">
                  <span class="text-[#707D76] text-[11px]">审批好友：<strong class="text-[#1C2621]">${app.reviewerName}</strong></span>
                </div>
                <span class="${isReject ? 'text-[#A84A38] font-bold' : 'text-[#345942] font-bold'} text-[11px]">
                  ${isReject ? '🛡️ 驳回劝退' : '✅ 准予购买'}
                </span>
              `}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 分栏 2：待我审批列表 (包含待审与已完成)
  const pendingForMeList = document.getElementById('approvals-for-me-pending-list');
  if (pendingForMeList) {
    if (pendingForMe.length === 0) {
      pendingForMeList.innerHTML = `
        <div class="bg-white rounded-2xl p-4 text-center text-xs text-[#707D76] border border-[#F3EDE2]">
          🎉 暂无待处理的好友申请，已全部完成！
        </div>
      `;
    } else {
      pendingForMeList.innerHTML = pendingForMe.map(c => `
        <div class="bg-white rounded-2xl p-4 border border-[#F3EDE2] shadow-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-[#EADBCA] bg-[#FAF5ED] shrink-0">
              <img src="${c.applicantAvatar}" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-[#1C2621]">${c.applicantName}</span>
                <span class="text-[9px] text-[#A67E48] bg-[#FAF5ED] px-1.5 py-0.2 rounded border border-[#EADBCA]">求把关</span>
              </div>
              <h4 class="text-xs font-bold text-[#1C2621] mt-0.5 truncate">${c.item}</h4>
              <p class="text-[10px] text-[#707D76] truncate">自述：“${c.reason}”</p>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="font-din text-sm font-bold text-[#1C2621] block">¥${parseFloat(c.cost).toFixed(2)}</span>
            <button onclick="openCourtCaseModal('${c.id}')" class="mt-1 text-[11px] font-bold text-white bg-[#181D1B] hover:bg-[#2A312F] px-3 py-1 rounded-full shadow-xs active:scale-95 transition-transform">
              立即审批
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  // 已完成审批历史
  const reviewedList = document.getElementById('approvals-for-me-reviewed-list');
  if (reviewedList) {
    if (reviewedHistory.length === 0) {
      reviewedList.innerHTML = `<div class="bg-white rounded-2xl p-3 text-center text-xs text-[#707D76] border border-[#F3EDE2]">暂无已审历史</div>`;
    } else {
      reviewedList.innerHTML = reviewedHistory.map(r => `
        <div onclick="openCaseDetailModal('${r.id}', 'for_me')" class="bg-white rounded-2xl p-3.5 border border-[#F3EDE2] shadow-2xs cursor-pointer hover:bg-[#FAF7F2] transition-colors">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-[#1C2621]">${r.item} (申请人: ${r.applicantName})</span>
            <span class="font-din text-xs font-black text-[#1C2621]">¥${parseFloat(r.cost).toFixed(2)}</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-[#707D76] mt-1">
            <span class="${r.status === 'rejected' ? 'text-[#A84A38] font-bold' : 'text-[#345942] font-bold'}">
              ${r.status === 'rejected' ? '🛡️ 已劝阻驳回' : '✅ 已允许购买'}
            </span>
            <span class="truncate max-w-[180px]">评语：“${r.reviewerOpinion}”</span>
          </div>
        </div>
      `).join('');
    }
  }
}

// 4. 个人中心页渲染
function renderProfile() {
  const avatarImg = document.getElementById('profile-avatar-img');
  const userName = document.getElementById('profile-user-name');
  const userTag = document.getElementById('profile-user-tag');

  if (avatarImg) avatarImg.src = currentUser.avatar;
  if (userName) userName.innerText = currentUser.nickname;
  if (userTag) userTag.innerText = currentUser.tag || '理智把关人';

  // 战绩展台
  let mySaved = 0;
  myApplications.forEach(a => {
    if (a.status === 'rejected') {
      mySaved += parseFloat(a.cost || 0);
    }
  });
  const savedForMeEl = document.getElementById('profile-saved-for-me');
  const savedForFriendEl = document.getElementById('profile-saved-for-friend');

  if (savedForMeEl) savedForMeEl.innerText = `¥${(mySaved + 1699.00).toFixed(2)}`;
  if (savedForFriendEl) savedForFriendEl.innerText = `¥1,087.00`;

  // 身份切换高亮更新
  ['self', 'xiaomei', 'daming'].forEach(idKey => {
    const btn = document.getElementById(`ident-btn-${idKey}`);
    if (!btn) return;
    if (currentUser.id === PRESET_IDENTITIES[idKey]?.id) {
      btn.className = "bg-[#FAF7F2] p-2 rounded-xl border-2 border-[#1C2621] text-center transition-all";
      const sub = btn.querySelector('span:last-child');
      if (sub) {
        sub.innerText = '当前使用';
        sub.className = 'text-[8px] text-[#1C2621] font-bold';
      }
    } else {
      btn.className = "bg-[#FFFFFF] p-2 rounded-xl border border-[#EADBCA] hover:bg-[#FAF7F2] text-center transition-all";
      const sub = btn.querySelector('span:last-child');
      if (sub) {
        sub.innerText = '点击切换';
        sub.className = 'text-[8px] text-[#707D76]';
      }
    }
  });
}

// ==================== 身份授权与登录管理 (User Auth & Mandatory Login) ====================
function checkAuthRequired() {
  if (!currentUser || !currentUser.authorized) {
    openAuthModal(false);
    return false;
  }
  return true;
}

function openAuthModal(isEditing = true) {
  const modal = document.getElementById('modal-auth-login');
  const closeBtn = document.getElementById('auth-modal-close-btn');
  const title = document.getElementById('auth-modal-title');
  const input = document.getElementById('auth-nickname-input');
  const preview = document.getElementById('auth-avatar-preview');
  const submitText = document.getElementById('auth-submit-btn-text');

  selectedTempAvatar = currentUser.avatar || '/assets/loewe_tomato_banner.jpg';
  if (preview) preview.src = selectedTempAvatar;
  if (input) input.value = currentUser.nickname || '理智管家阿强';

  if (!isEditing && !currentUser.authorized) {
    if (closeBtn) closeBtn.classList.add('hidden');
    if (title) title.innerText = '微信审批身份授权';
    if (submitText) submitText.innerText = '确认授权 · 开启理智审批';
  } else {
    if (closeBtn) closeBtn.classList.remove('hidden');
    if (title) title.innerText = '修改微信资料';
    if (submitText) submitText.innerText = '保存修改并更新';
  }

  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('modal-auth-login');
  if (modal) modal.classList.add('hidden');
}

function openEditProfileModal() {
  openAuthModal(true);
}

function selectPresetAvatar(avatarUrl) {
  selectedTempAvatar = avatarUrl;
  const preview = document.getElementById('auth-avatar-preview');
  if (preview) preview.src = avatarUrl;
}

function handleAvatarFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedTempAvatar = e.target.result;
    const preview = document.getElementById('auth-avatar-preview');
    if (preview) preview.src = selectedTempAvatar;
  };
  reader.readAsDataURL(file);
}

function randomizeNickname() {
  const names = [
    '理智管家阿强', '理性省钱仙人', '反内卷守财奴', '一毛不拔小行家',
    '清心寡欲阿梅', '刚需终审官', '冷静拔草先锋', '钱袋金牌守门员'
  ];
  const random = names[Math.floor(Math.random() * names.length)];
  const input = document.getElementById('auth-nickname-input');
  if (input) input.value = random;
}

function confirmSaveProfileAuth() {
  const input = document.getElementById('auth-nickname-input');
  const name = (input ? input.value : '').trim();

  if (!name) {
    alert('请输入您的审批昵称，让好友一眼能辨明是哪位好友在把关。');
    if (input) input.focus();
    return;
  }

  currentUser.nickname = name;
  currentUser.avatar = selectedTempAvatar || '/assets/loewe_tomato_banner.jpg';
  currentUser.authorized = true;

  saveStateToStorage();
  closeAuthModal();
  renderAll();

  playWindChimeSound();
}

function switchTestIdentity(key) {
  if (!PRESET_IDENTITIES[key]) return;
  currentUser = { ...PRESET_IDENTITIES[key], authorized: true };
  saveStateToStorage();
  renderAll();
  playWindChimeSound();
}

// ==================== 发起“我想买”与分享微信 ====================
function openApplyModal() {
  if (!checkAuthRequired()) return;
  document.getElementById('modal-apply-create').classList.remove('hidden');
  const itemEl = document.getElementById('apply-input-item');
  if (itemEl) itemEl.focus();
}

function closeApplyModal() {
  document.getElementById('modal-apply-create').classList.add('hidden');
}

function confirmSubmitApply() {
  const itemEl = document.getElementById('apply-input-item');
  const costEl = document.getElementById('apply-input-cost');
  const noteEl = document.getElementById('apply-input-note');

  const item = (itemEl ? itemEl.value : '').trim();
  const cost = (costEl ? costEl.value : '').trim();
  const reason = (noteEl ? noteEl.value : '').trim();

  if (!item) {
    alert('请填写想买的物品名称！');
    if (itemEl) itemEl.focus();
    return;
  }
  if (!cost || isNaN(cost) || parseFloat(cost) <= 0) {
    alert('请填写合理的花费预算金额！');
    if (costEl) costEl.focus();
    return;
  }

  const costVal = parseFloat(cost).toFixed(2);
  const newAppId = 'app_my_' + Date.now();

  const newApp = {
    id: newAppId,
    item: item,
    cost: parseFloat(costVal),
    reason: reason || '想买一件好物提升生活品质，请好友帮我把关！',
    applicantName: currentUser.nickname,
    applicantAvatar: currentUser.avatar,
    status: 'pending',
    reviewerName: '',
    reviewerAvatar: '',
    reviewerOpinion: '',
    time: '刚刚',
    timestamp: Date.now()
  };

  myApplications.unshift(newApp);
  saveStateToStorage();

  currentShareCase = {
    id: newAppId,
    item: item,
    cost: costVal,
    reason: newApp.reason
  };

  if (itemEl) itemEl.value = '';
  if (costEl) costEl.value = '';
  if (noteEl) noteEl.value = '';

  closeApplyModal();
  renderAll();

  openShareApprovalModal(currentShareCase.item, currentShareCase.cost, currentShareCase.reason, newAppId);
}

function openShareApprovalModal(item, cost, reason, appId) {
  currentShareCase = {
    id: appId || (myApplications[0] ? myApplications[0].id : ''),
    item: item,
    cost: cost,
    reason: reason
  };

  document.getElementById('share-modal-item').innerText = item;
  document.getElementById('share-modal-cost').innerText = `¥${cost}`;
  document.getElementById('share-modal-reason').innerText = `“${reason}”`;

  const toast = document.getElementById('share-toast-copied');
  if (toast) toast.classList.add('hidden');
  const btnText = document.getElementById('btn-send-text');
  if (btnText) btnText.innerText = '分享到微信 · 发送给好友审批';

  document.getElementById('modal-share-approval').classList.remove('hidden');
}

function closeShareApprovalModal() {
  document.getElementById('modal-share-approval').classList.add('hidden');
}

function sendToFriendsAction() {
  const shareText = `【理智好友审批单】我正在纠结要不要入手「${currentShareCase.item} (¥${currentShareCase.cost})」，特请好友帮我把关！理由：“${currentShareCase.reason}”。打开抠门大赛给我投票吧~`;

  if (navigator.share) {
    navigator.share({
      title: '好友理性审批把关',
      text: shareText,
      url: window.location.href
    }).catch(() => {});
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).catch(() => {});
  }

  const toast = document.getElementById('share-toast-copied');
  if (toast) {
    toast.innerText = '✓ 已复制微信审批口令与链接！直接粘贴发送到微信好友即可';
    toast.classList.remove('hidden');
  }
  const btnText = document.getElementById('btn-send-text');
  if (btnText) btnText.innerText = '✓ 口令已就绪，可随时粘贴发送';

  setTimeout(() => {
    if (btnText) btnText.innerText = '分享到微信 · 发送给好友审批';
  }, 3500);
}

// 快捷模拟好友在线审批：用户发起后一键模拟微信好友审批完成并在首页呈现通过/拒绝！
function quickSimulateFriendJudgeModal() {
  const appId = currentShareCase.id;
  const targetApp = myApplications.find(a => a.id === appId) || myApplications[0];

  if (!targetApp) {
    return;
  }

  const mockFriend = PRESET_IDENTITIES.xiaomei;
  const funnyRejectionQuotes = [
    '这种东西买回去就是吃灰，忍住别冲动，听我的坚决驳回！省下的钱周末请自己吃顿好吃的~',
    '三分钟热度警告！上个月买的都还没拆封呢，这笔绝对不能花！',
    '刚需指数只有一星，冲动指数五颗星，一票否决！快把购物车删掉！'
  ];
  const randomQuote = funnyRejectionQuotes[Math.floor(Math.random() * funnyRejectionQuotes.length)];

  targetApp.status = 'rejected';
  targetApp.reviewerName = mockFriend.nickname;
  targetApp.reviewerAvatar = mockFriend.avatar;
  targetApp.reviewerOpinion = randomQuote;
  targetApp.time = '刚刚';

  latestNotification = {
    show: true,
    appId: targetApp.id,
    applicantItem: targetApp.item,
    cost: targetApp.cost,
    status: 'rejected',
    reviewerName: mockFriend.nickname,
    reviewerAvatar: mockFriend.avatar,
    reviewerOpinion: randomQuote,
    time: '刚刚'
  };

  saveStateToStorage();
  closeShareApprovalModal();
  navigateTab('home');

  playRejectWoodGavelSound();
}

function closeHomeAlertNotification() {
  if (latestNotification) {
    latestNotification.show = false;
    saveStateToStorage();
    renderHome();
  }
}

// ==================== 好友公审庭弹窗与审批逻辑 (Court & Approval Modal) ====================
function openCourtCaseModal(caseId) {
  if (!checkAuthRequired()) return;

  currentReviewCaseId = caseId;
  pendingDecisionData = null;

  const caseData = pendingForMe.find(c => c.id === caseId) || {
    id: caseId,
    applicantName: '好友',
    applicantAvatar: '/assets/loewe_tomato_banner.jpg',
    item: '待购好物',
    cost: 299.00,
    reason: '请好友把关...'
  };

  const nameEl = document.getElementById('modal-applicant-name');
  const avatarEl = document.getElementById('modal-applicant-avatar');
  const itemEl = document.getElementById('modal-applicant-item-title');
  const priceEl = document.getElementById('modal-applicant-price');
  const stateEl = document.getElementById('modal-applicant-statement');
  const curRevAvatar = document.getElementById('court-current-reviewer-avatar');
  const curRevName = document.getElementById('court-current-reviewer-name');

  if (nameEl) nameEl.innerText = caseData.applicantName;
  if (avatarEl) avatarEl.src = caseData.applicantAvatar || '/assets/loewe_tomato_banner.jpg';
  if (itemEl) itemEl.innerText = caseData.item;
  if (priceEl) priceEl.innerText = `¥${parseFloat(caseData.cost).toFixed(2)}`;
  if (stateEl) stateEl.innerText = `“${caseData.reason}”`;
  if (curRevAvatar) curRevAvatar.src = currentUser.avatar;
  if (curRevName) curRevName.innerText = currentUser.nickname;

  document.getElementById('modal-decision-buttons').classList.remove('hidden');
  document.getElementById('modal-stamp-result').classList.add('hidden');

  const inputEl = document.getElementById('modal-review-input');
  if (inputEl) {
    inputEl.value = '';
    inputEl.classList.remove('input-error-shake', 'border-[#A84A38]');
    inputEl.classList.add('border-[#EADBCA]');
  }
  const errorTip = document.getElementById('review-error-tip');
  if (errorTip) errorTip.classList.add('hidden');

  const cardBox = document.getElementById('approval-card-box');
  if (cardBox) cardBox.classList.remove('card-reject-shake');
  const canvasContainer = document.getElementById('burst-canvas-container');
  if (canvasContainer) canvasContainer.innerHTML = '';

  document.getElementById('modal-court').classList.remove('hidden');
}

function closeCourtModal() {
  document.getElementById('modal-court').classList.add('hidden');
}

function applyDecision(decision) {
  const inputEl = document.getElementById('modal-review-input');
  const errorTip = document.getElementById('review-error-tip');
  const cardBox = document.getElementById('approval-card-box');
  const opinionText = (inputEl ? inputEl.value : '').trim();

  if (!opinionText) {
    if (errorTip) errorTip.classList.remove('hidden');
    if (inputEl) {
      inputEl.classList.remove('border-[#EADBCA]');
      inputEl.classList.add('border-[#A84A38]', 'input-error-shake');
      inputEl.focus();
      setTimeout(() => {
        inputEl.classList.remove('input-error-shake');
      }, 600);
    }
    return;
  }

  if (errorTip) errorTip.classList.add('hidden');
  if (inputEl) {
    inputEl.classList.remove('border-[#A84A38]');
    inputEl.classList.add('border-[#EADBCA]');
  }

  pendingDecisionData = {
    decision: decision,
    opinion: opinionText
  };

  if (decision === 'reject') {
    playRejectWoodGavelSound();
    if (cardBox) {
      cardBox.classList.remove('card-reject-shake');
      void cardBox.offsetWidth;
      cardBox.classList.add('card-reject-shake');
      setTimeout(() => cardBox.classList.remove('card-reject-shake'), 600);
    }
  } else {
    triggerBotanicalRibbonBurst();
  }

  document.getElementById('modal-decision-buttons').classList.add('hidden');
  const stampContainer = document.getElementById('modal-stamp-result');
  const stampBadge = document.getElementById('stamp-seal');
  const stampTitle = document.getElementById('stamp-title');
  const stampSub = document.getElementById('stamp-sub-text');
  const summaryText = document.getElementById('stamp-summary');
  const opinionEl = document.getElementById('stamp-opinion-text');

  const caseData = pendingForMe.find(c => c.id === currentReviewCaseId);
  const costDisplay = caseData ? `¥${parseFloat(caseData.cost).toFixed(2)}` : '';

  if (decision === 'reject') {
    stampBadge.className = "stamp-animate inline-block border-4 border-double px-4 py-2 rounded-xl text-center border-[#A84A38] text-[#A84A38] bg-[#FAF5ED]";
    stampTitle.innerText = "驳回申请 · 守住钱袋";
    stampSub.innerText = `已守住 ${costDisplay} 金库`;
    summaryText.innerText = "审批结果：驳回成功！已帮好友成功劝退";
    summaryText.className = "text-xs font-bold text-[#A84A38]";
    opinionEl.innerText = `审批理由：“${opinionText}”`;
  } else {
    stampBadge.className = "stamp-animate inline-block border-4 border-double px-4 py-2 rounded-xl text-center border-[#181D1B] text-[#181D1B] bg-[#FAF7F2]";
    stampTitle.innerText = "允许购买 · 确认刚需";
    stampSub.innerText = "放行通关";
    summaryText.innerText = "审批结果：允许购买！已核准刚需";
    summaryText.className = "text-xs font-bold text-[#181D1B]";
    opinionEl.innerText = `审批理由：“${opinionText}”`;
  }

  stampContainer.classList.remove('hidden');
  // 核心改进：立即自动完成审批流转，无需用户再次手动点击“确认并完成审批”
  const caseIdx = pendingForMe.findIndex(c => c.id === currentReviewCaseId);
  if (caseIdx !== -1) {
    const finishedCase = pendingForMe[caseIdx];

    // 1. 彻底从未处理列表中删除
    pendingForMe.splice(caseIdx, 1);

    // 2. 存入已完成历史
    const historyRecord = {
      id: finishedCase.id,
      item: finishedCase.item,
      cost: finishedCase.cost,
      reason: finishedCase.reason,
      applicantName: finishedCase.applicantName,
      applicantAvatar: finishedCase.applicantAvatar,
      status: decision === 'reject' ? 'rejected' : 'approved',
      reviewerName: currentUser.nickname,
      reviewerAvatar: currentUser.avatar,
      reviewerOpinion: opinionText,
      time: '刚刚',
      timestamp: Date.now()
    };
    reviewedHistory.unshift(historyRecord);

    // 3. 如果当前恰好审批的是本人发起的单子，同步更新我发起的进度
    const myAppMatch = myApplications.find(a => a.id === currentReviewCaseId);
    if (myAppMatch) {
      myAppMatch.status = historyRecord.status;
      myAppMatch.reviewerName = currentUser.nickname;
      myAppMatch.reviewerAvatar = currentUser.avatar;
      myAppMatch.reviewerOpinion = opinionText;
    }

    saveStateToStorage();
    renderAll();
  }

  // 核心动效：为当前审批卡片添加‘缩小并平滑滑入底部统计页’过渡动画，增强归档反馈
  setTimeout(() => {
    if (cardBox) {
      cardBox.classList.add('card-fly-to-stats');
    }
    // 底部导航栏上的“统计”按钮同步触发高亮脉冲反馈
    const navStatsBtn = document.getElementById('nav-stats');
    if (navStatsBtn) {
      navStatsBtn.classList.remove('stats-nav-bounce');
      void navStatsBtn.offsetWidth;
      navStatsBtn.classList.add('stats-nav-bounce');
      setTimeout(() => navStatsBtn.classList.remove('stats-nav-bounce'), 1200);
    }
  }, 800);

  // 1.5 秒后完成平滑关闭与清理，状态已沉淀入统计页
  setTimeout(() => {
    closeCourtModal();
    if (cardBox) {
      cardBox.classList.remove('card-fly-to-stats');
    }
    currentReviewCaseId = null;
    pendingDecisionData = null;
  }, 1500);
}

// 兼容调用：关闭弹窗清理
function confirmCloseCourtModal() {
  closeCourtModal();
  currentReviewCaseId = null;
  pendingDecisionData = null;
}

// ==================== 查看裁决书案卷明细弹窗 (Case Detail Modal) ====================
function openCaseDetailModal(caseId, type = 'my') {
  let caseData = null;
  if (type === 'my') {
    caseData = myApplications.find(a => a.id === caseId);
  } else {
    caseData = reviewedHistory.find(r => r.id === caseId) || pendingForMe.find(p => p.id === caseId);
  }

  if (!caseData) {
    caseData = myApplications[0] || DEFAULT_MY_APPLICATIONS[0];
  }

  const itemEl = document.getElementById('cdetail-item');
  const costEl = document.getElementById('cdetail-cost');
  const reasonEl = document.getElementById('cdetail-reason');
  const statusTag = document.getElementById('cdetail-status-tag');
  const timeEl = document.getElementById('cdetail-time');
  const revAvatar = document.getElementById('cdetail-reviewer-avatar');
  const revName = document.getElementById('cdetail-reviewer-name');
  const opinionEl = document.getElementById('cdetail-opinion');
  const resultBox = document.getElementById('cdetail-result-box');

  if (itemEl) itemEl.innerText = caseData.item;
  if (costEl) costEl.innerText = `¥${parseFloat(caseData.cost).toFixed(2)}`;
  if (reasonEl) reasonEl.innerText = `“${caseData.reason}”`;
  if (timeEl) timeEl.innerText = caseData.time || '刚刚';

  const isReject = caseData.status === 'rejected';
  const isPending = caseData.status === 'pending';

  if (isPending) {
    if (statusTag) statusTag.innerText = '审批进行中';
    if (resultBox) resultBox.className = 'p-3.5 rounded-xl border border-[#EADBCA] bg-[#FAF5ED] text-left';
    if (revAvatar) revAvatar.src = '/assets/loewe_stats_cactus.jpg';
    if (revName) revName.innerText = '等待好友审批投票';
    if (opinionEl) opinionEl.innerText = '“审批单已立，等待好友一票裁决...”';
  } else {
    if (statusTag) {
      statusTag.innerText = isReject ? '🛡️ 已劝阻驳回 · 守住钱袋' : '✅ 已批准放行 · 准予购买';
      statusTag.className = `text-xs font-bold ${isReject ? 'text-[#A84A38]' : 'text-[#345942]'}`;
    }
    if (resultBox) {
      resultBox.className = `p-3.5 rounded-xl border ${isReject ? 'border-[#F6DCD8] bg-[#FAF2F0]' : 'border-[#DCE8E1] bg-[#F0F5F2]'} text-left`;
    }
    if (revAvatar) revAvatar.src = caseData.reviewerAvatar || '/assets/loewe_stats_cactus.jpg';
    if (revName) revName.innerText = `审批好友：${caseData.reviewerName || '好友'}`;
    if (opinionEl) opinionEl.innerText = `“${caseData.reviewerOpinion || '坚决帮你守住钱袋！'}”`;
  }

  document.getElementById('modal-case-detail').classList.remove('hidden');
}

function closeCaseDetailModal() {
  document.getElementById('modal-case-detail').classList.add('hidden');
}

// ==================== Web Audio API 声学合成引擎 ====================
let audioCtxInstance = null;

function getAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtxInstance) {
      audioCtxInstance = new AudioContextClass();
    }
    if (audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }
    return audioCtxInstance;
  } catch (e) {
    console.warn('AudioContext not supported or restricted:', e);
    return null;
  }
}

function playRejectWoodGavelSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.25);
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

function playCuteApprovalSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.26, now);
    masterGain.connect(ctx.destination);

    const notes = [
      { f: 698.46, t: 0.00, dur: 0.35, g: 0.16 },
      { f: 880.00, t: 0.07, dur: 0.38, g: 0.18 },
      { f: 1046.50, t: 0.14, dur: 0.42, g: 0.22 },
      { f: 1318.51, t: 0.21, dur: 0.65, g: 0.25 }
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      g.gain.setValueAtTime(0.0001, now + note.t);
      g.gain.linearRampToValueAtTime(note.g, now + note.t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.dur);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.dur + 0.02);
    });
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

function playWindChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, now);
    masterGain.connect(ctx.destination);

    const chimeTubes = [
      { freq: 1318.51, delay: 0.000, gain: 0.20, decay: 1.4 },
      { freq: 1567.98, delay: 0.040, gain: 0.22, decay: 1.6 },
      { freq: 1760.00, delay: 0.085, gain: 0.18, decay: 1.3 },
      { freq: 1975.53, delay: 0.130, gain: 0.22, decay: 1.7 }
    ];

    chimeTubes.forEach(tube => {
      const startTime = now + tube.delay;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(tube.freq, startTime);

      gain1.gain.setValueAtTime(0.0001, startTime);
      gain1.gain.linearRampToValueAtTime(tube.gain, startTime + 0.003);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + tube.decay);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(startTime);
      osc1.stop(startTime + tube.decay + 0.05);
    });
  } catch (err) {
    console.warn('Audio error:', err);
  }
}

function triggerBotanicalRibbonBurst() {
  playCuteApprovalSound();

  const container = document.getElementById('burst-canvas-container');
  if (!container) return;
  container.innerHTML = '';

  const particleCount = 20;
  const ribbonTemplates = [
    `<svg viewBox="0 0 28 28" fill="none" class="w-6 h-6"><circle cx="14" cy="14" r="10" fill="#FFC933" /><circle cx="11" cy="12" r="1.3" fill="#6B4B03" /><path d="M12.5 16 Q14 18 15.5 16" stroke="#6B4B03" stroke-width="1.3" stroke-linecap="round" fill="none" /></svg>`,
    `<svg viewBox="0 0 26 26" fill="none" class="w-6 h-6"><path d="M13 22 C13 14 13 8 13 6" stroke="#3C624B" stroke-width="2" stroke-linecap="round" /><path d="M13 11 C8 9 5 14 13 15" fill="#588D6A" stroke="#2D4D39" stroke-width="1" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2 Z" fill="#F4BD38" /></svg>`,
    `<svg viewBox="0 0 32 16" fill="none" class="w-7 h-3.5"><path d="M2 12 C10 2, 22 14, 30 4" stroke="#FFA394" stroke-width="2" stroke-linecap="round" /></svg>`
  ];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'cute-pass-particle';

    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * (Math.PI * 1.15);
    const distance = 90 + Math.random() * 130;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 35;
    const rot = ((Math.random() - 0.5) * 100) + 'deg';
    const duration = (1.3 + Math.random() * 0.6).toFixed(2) + 's';

    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--rot', rot);
    particle.style.setProperty('--dur', duration);

    particle.style.left = '70%';
    particle.style.bottom = '44px';
    particle.style.marginLeft = '-14px';

    particle.innerHTML = ribbonTemplates[i % ribbonTemplates.length];
    container.appendChild(particle);
  }
}

function tapTomatoRibbon() {
  playWindChimeSound();
  const card = document.getElementById('home-botanical-card');
  const img = document.getElementById('home-botanical-img');
  const aura = document.getElementById('home-botanical-aura');

  [card, img, aura].forEach(el => {
    if (!el) return;
    el.classList.remove('botanical-breathing-tremor', 'specimen-leaf-jitter', 'botanical-aura-pulse');
    void el.offsetWidth;
  });

  if (card) card.classList.add('botanical-breathing-tremor');
  if (img) img.classList.add('specimen-leaf-jitter');
  if (aura) aura.classList.add('botanical-aura-pulse');

  setTimeout(() => {
    if (card) card.classList.remove('botanical-breathing-tremor');
    if (img) img.classList.remove('specimen-leaf-jitter');
    if (aura) aura.classList.remove('botanical-aura-pulse');
  }, 900);
}

// ==================== 个人中心：理智之花（抵制之花）精致交互与甘霖花瓣动效 ====================
let flowerBloomTotalCount = 4;
let rainTimeoutId = null;
let petalsTimeoutId = null;

// 甘霖小雨雨丝与润土微澜动效
function startFlowerRain(durationMs = 2800) {
  const rainLayer = document.getElementById('flower-rain-layer');
  if (!rainLayer) return;
  if (rainTimeoutId) clearTimeout(rainTimeoutId);

  rainLayer.innerHTML = '';
  rainLayer.style.opacity = '1';

  // 10 滴轻柔雨丝交错散落
  const dropsCount = 10;
  for (let i = 0; i < dropsCount; i++) {
    const drop = document.createElement('div');
    drop.className = 'flower-raindrop';
    const leftPercent = 12 + Math.floor((i * (76 / dropsCount)) + (Math.random() * 6 - 3));
    const delay = (Math.random() * 0.7).toFixed(2);
    const duration = (1.0 + Math.random() * 0.4).toFixed(2);
    drop.style.left = `${leftPercent}%`;
    drop.style.setProperty('--delay', `${delay}s`);
    drop.style.setProperty('--duration', `${duration}s`);
    rainLayer.appendChild(drop);
  }

  // 4 个基底土壤微波水花
  const splashes = [26, 44, 62, 78];
  splashes.forEach((pos, idx) => {
    const splash = document.createElement('div');
    splash.className = 'flower-splash';
    splash.style.left = `${pos}%`;
    splash.style.bottom = `${10 + (idx % 2) * 2}px`;
    splash.style.setProperty('--delay', `${0.25 + idx * 0.22}s`);
    rainLayer.appendChild(splash);
  });

  if (durationMs > 0) {
    rainTimeoutId = setTimeout(() => {
      stopFlowerRain();
    }, durationMs);
  }
}

function stopFlowerRain() {
  const rainLayer = document.getElementById('flower-rain-layer');
  if (!rainLayer) return;
  rainLayer.style.opacity = '0';
  setTimeout(() => {
    if (rainLayer && rainLayer.style.opacity === '0') {
      rainLayer.innerHTML = '';
    }
  }, 600);
}

// 随风飘舞雅致花瓣动效 (落英缤纷)
function startFlowerPetals(durationMs = 5500) {
  const petalsLayer = document.getElementById('flower-petals-layer');
  if (!petalsLayer) return;
  if (petalsTimeoutId) clearTimeout(petalsTimeoutId);

  petalsLayer.innerHTML = '';
  petalsLayer.style.opacity = '1';

  const petalColors = ['#D47761', '#E2927C', '#F8C7BA', '#FADED4', '#E89A84', '#FAF0EB'];
  const petalsCount = 14;

  for (let i = 0; i < petalsCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'flower-petal';
    const color = petalColors[i % petalColors.length];
    const leftPercent = 8 + Math.floor((i * (84 / petalsCount)) + (Math.random() * 6 - 3));
    const driftX = (Math.random() > 0.5 ? 1 : -1) * Math.floor(10 + Math.random() * 16);
    const rotDeg = Math.floor(120 + Math.random() * 240);
    const delay = (Math.random() * 1.5).toFixed(2);
    const duration = (2.3 + Math.random() * 0.9).toFixed(2);
    const size = 9 + Math.floor(Math.random() * 5);

    petal.style.left = `${leftPercent}%`;
    petal.style.setProperty('--drift-x', `${driftX}px`);
    petal.style.setProperty('--rot-deg', `${rotDeg}deg`);
    petal.style.setProperty('--delay', `${delay}s`);
    petal.style.setProperty('--duration', `${duration}s`);

    petal.innerHTML = `
      <svg viewBox="0 0 16 16" width="${size}" height="${size}" style="fill: ${color}; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.06)); opacity: 0.92;">
        <path d="M 8 1 C 12 4 15 9 13 13 C 11 15 6 16 3 13 C 1 10 3 5 8 1 Z" />
      </svg>
    `;
    petalsLayer.appendChild(petal);
  }

  if (durationMs > 0) {
    petalsTimeoutId = setTimeout(() => {
      stopFlowerPetals();
    }, durationMs);
  }
}

function stopFlowerPetals() {
  const petalsLayer = document.getElementById('flower-petals-layer');
  if (!petalsLayer) return;
  petalsLayer.style.opacity = '0';
  setTimeout(() => {
    if (petalsLayer && petalsLayer.style.opacity === '0') {
      petalsLayer.innerHTML = '';
    }
  }, 700);
}

// 阶段定义与控制 (严格容器约束，绝不撑破卡片)
function setFlowerStage(stageNum) {
  const stage = document.getElementById('reason-plant-stage');
  const badgeEl = document.getElementById('flower-stage-badge');
  const statusDescEl = document.getElementById('flower-status-desc');
  const step1 = document.getElementById('flower-step-1');
  const step2 = document.getElementById('flower-step-2');
  const step3 = document.getElementById('flower-step-3');
  const step4 = document.getElementById('flower-step-4');

  if (!stage) return;

  // 严格重设样式与 containment
  stage.className = `plant-stage is-stage-${stageNum} w-[96px] h-[116px] max-w-full max-h-full flex items-center justify-center relative overflow-hidden`;
  stage.style.contain = 'content';
  stage.style.overflow = 'hidden';

  const resetStepStyles = () => {
    [step1, step2, step3, step4].forEach(s => {
      if (s) s.className = "py-1 px-1 rounded-lg text-[#707D76] hover:bg-[#FAF5ED] font-medium transition-all text-center cursor-pointer truncate";
    });
  };
  resetStepStyles();

  if (stageNum === 1) {
    if (step1) step1.className = "py-1 px-1 rounded-lg bg-[#FAF5ED] text-[#8C6D40] font-bold border border-[#EADBCA] transition-all text-center cursor-pointer truncate";
    if (badgeEl) badgeEl.innerText = "STAGE 01 · 种子沉睡";
    if (statusDescEl) statusDescEl.innerText = "🌱 静伏沃土，等待甘霖与客观劝阻";
    stopFlowerRain();
    stopFlowerPetals();
  } else if (stageNum === 2) {
    if (step2) step2.className = "py-1 px-1 rounded-lg bg-[#FAF5ED] text-[#345942] font-bold border border-[#EADBCA] transition-all text-center cursor-pointer truncate";
    if (badgeEl) badgeEl.innerText = "STAGE 02 · 破土拔节";
    if (statusDescEl) statusDescEl.innerText = "🌿 饱吸甘霖，破土拔节茁壮成长";
    startFlowerRain(3500);
    stopFlowerPetals();
  } else if (stageNum === 3) {
    if (step3) step3.className = "py-1 px-1 rounded-lg bg-[#FAF5ED] text-[#345942] font-bold border border-[#EADBCA] transition-all text-center cursor-pointer truncate";
    if (badgeEl) badgeEl.innerText = "STAGE 03 · 双叶舒展";
    if (statusDescEl) statusDescEl.innerText = "🍃 青翠双叶轻柔舒展，晨露晶莹";
    stopFlowerRain();
    stopFlowerPetals();
  } else if (stageNum === 4) {
    if (step4) step4.className = "py-1 px-1 rounded-lg bg-[#EBF4EE] text-[#345942] font-bold border border-[#D5E8DC] transition-all text-center cursor-pointer truncate";
    if (badgeEl) badgeEl.innerText = "STAGE 04 · 繁花盛放";
    if (statusDescEl) statusDescEl.innerText = "✿ 繁花盛放，守护每一份理智财富";
    stopFlowerRain();
    startFlowerPetals(5500);
  }
}

function bloomReasonFlower() {
  const stage = document.getElementById('reason-plant-stage');
  const countEl = document.getElementById('flower-bloom-count');
  const badgeEl = document.getElementById('flower-stage-badge');
  const statusDescEl = document.getElementById('flower-status-desc');

  if (!stage) return;
  if (stage.classList.contains('is-growing')) return;

  playWindChimeSound();

  // 1. 阶段 1：沉睡种子 + 细雨如酥甘霖滋润 (0s)
  setFlowerStage(1);
  stage.className = 'plant-stage is-stage-1 is-growing w-[96px] h-[116px] max-w-full max-h-full flex items-center justify-center relative overflow-hidden';
  stage.style.contain = 'content';
  stage.style.overflow = 'hidden';
  if (badgeEl) badgeEl.innerText = "STAGE 01 · 润物细雨";
  if (statusDescEl) statusDescEl.innerText = "🌧️ 细雨甘霖淅淅沥沥，滋润理智之种";
  startFlowerRain(2200);

  // 2. 阶段 2：破土拔节 (0.8s)
  setTimeout(() => {
    setFlowerStage(2);
    stage.className = 'plant-stage is-stage-2 is-growing w-[96px] h-[116px] max-w-full max-h-full flex items-center justify-center relative overflow-hidden';
    stage.style.contain = 'content';
    stage.style.overflow = 'hidden';
    if (badgeEl) badgeEl.innerText = "STAGE 02 · 破土抽芽";
    if (statusDescEl) statusDescEl.innerText = "🌿 饱吸雨露破土拔节，青翠主茎伸展";
  }, 800);

  // 3. 阶段 3：青翠双叶舒展 (1.6s)
  setTimeout(() => {
    setFlowerStage(3);
    stage.className = 'plant-stage is-stage-3 is-growing w-[96px] h-[116px] max-w-full max-h-full flex items-center justify-center relative overflow-hidden';
    stage.style.contain = 'content';
    stage.style.overflow = 'hidden';
    if (badgeEl) badgeEl.innerText = "STAGE 03 · 舒展晨露";
    if (statusDescEl) statusDescEl.innerText = "🍃 雨歇露凝双叶舒展，花蕾孕育";
    stopFlowerRain();
  }, 1600);

  // 4. 阶段 4：花开盛放 + 漫天落英花瓣飘拂 (2.4s)
  setTimeout(() => {
    setFlowerStage(4);
    stage.className = 'plant-stage is-stage-4 is-bloomed badge-interactive-active w-[96px] h-[116px] max-w-full max-h-full flex items-center justify-center relative overflow-hidden';
    stage.style.contain = 'content';
    stage.style.overflow = 'hidden';
    flowerBloomTotalCount += 1;
    if (countEl) countEl.innerText = `已盛开 ${flowerBloomTotalCount} 次`;
    if (badgeEl) badgeEl.innerText = "STAGE 04 · 繁花盛景";
    if (statusDescEl) statusDescEl.innerText = "✿ 繁花盛放，守护每一份理智财富";
    startFlowerPetals(6000);
    playWindChimeSound();
  }, 2400);
}

// ==================== 首页好友审批结果通知弹窗机制 ====================
function checkAndShowHomeApprovalNotice() {
  if (!latestNotification || !latestNotification.show) return;

  const modal = document.getElementById('modal-home-approval-notice');
  if (!modal) return;

  const isReject = latestNotification.status === 'rejected';
  const badgeEl = document.getElementById('home-notice-badge');
  const avatarEl = document.getElementById('home-notice-reviewer-avatar');
  const nameEl = document.getElementById('home-notice-reviewer-name');
  const timeEl = document.getElementById('home-notice-time');
  const statusTagEl = document.getElementById('home-notice-status-tag');
  const itemEl = document.getElementById('home-notice-item-name');
  const costEl = document.getElementById('home-notice-item-cost');
  const opinionEl = document.getElementById('home-notice-opinion');
  const tipBoxEl = document.getElementById('home-notice-tip-box');
  const tipTextEl = document.getElementById('home-notice-tip-text');

  if (avatarEl) avatarEl.src = latestNotification.reviewerAvatar || '/assets/loewe_stats_cactus.jpg';
  if (nameEl) nameEl.innerText = latestNotification.reviewerName || '好友';
  if (timeEl) timeEl.innerText = latestNotification.time || '刚刚';
  if (itemEl) itemEl.innerText = latestNotification.applicantItem || '未命名商品';
  if (costEl) costEl.innerText = `¥${parseFloat(latestNotification.cost || 0).toFixed(2)}`;
  if (opinionEl) opinionEl.innerText = `“${latestNotification.reviewerOpinion || '客观把关，理智消费！'}”`;

  if (isReject) {
    if (badgeEl) {
      badgeEl.className = "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1 bg-[#FAF2F0] text-[#A84A38] border-[#F6DCD8]";
      badgeEl.innerHTML = `<span>🛡️ 审批结果：好友已劝阻驳回</span>`;
    }
    if (statusTagEl) {
      statusTagEl.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2F0] text-[#A84A38] border border-[#F6DCD8]";
      statusTagEl.innerText = "已劝阻驳回";
    }
    if (tipBoxEl) {
      tipBoxEl.className = "bg-[#FAF2F0] rounded-xl p-2.5 border border-[#F6DCD8] mb-4 text-center";
    }
    if (tipTextEl) {
      tipTextEl.className = "text-[11px] font-bold text-[#A84A38]";
      tipTextEl.innerText = `✓ 成功拦截一笔冲动，为你守住 ¥${parseFloat(latestNotification.cost || 0).toFixed(2)} 并记入理智金库！`;
    }
  } else {
    if (badgeEl) {
      badgeEl.className = "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1 bg-[#EBF4EE] text-[#2E5339] border-[#D5E8DC]";
      badgeEl.innerHTML = `<span>✅ 审批结果：好友已批准放行</span>`;
    }
    if (statusTagEl) {
      statusTagEl.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#2E5339] border border-[#D5E8DC]";
      statusTagEl.innerText = "准许购买";
    }
    if (tipBoxEl) {
      tipBoxEl.className = "bg-[#EBF4EE] rounded-xl p-2.5 border border-[#D5E8DC] mb-4 text-center";
    }
    if (tipTextEl) {
      tipTextEl.className = "text-[11px] font-bold text-[#2E5339]";
      tipTextEl.innerText = `✓ 好友确认属于急需刚需支出，请按计划从容购买。`;
    }
  }

  modal.classList.remove('hidden');
}

function closeHomeApprovalNoticeModal() {
  const modal = document.getElementById('modal-home-approval-notice');
  if (modal) modal.classList.add('hidden');
  if (latestNotification) {
    latestNotification.show = false;
    saveStateToStorage();
  }
}

function goToApprovalDetailFromNotice() {
  if (latestNotification) {
    const appId = latestNotification.appId || 'app_my_101';
    latestNotification.show = false;
    saveStateToStorage();
    closeHomeApprovalNoticeModal();
    navigateTab('approvals');
    switchApprovalsTab('my');
    setTimeout(() => {
      openCaseDetailModal(appId, 'my');
    }, 150);
  } else {
    closeHomeApprovalNoticeModal();
  }
}

// ==================== 审批互助准则弹窗 ====================
function openRulesModal() {
  const modal = document.getElementById('modal-rules');
  if (modal) modal.classList.remove('hidden');
}

function closeRulesModal() {
  const modal = document.getElementById('modal-rules');
  if (modal) modal.classList.add('hidden');
}

// 挂载全局方法供 HTML inline onclick 调用
window.navigateTab = navigateTab;
window.switchApprovalsTab = switchApprovalsTab;
window.renderAll = renderAll;
window.renderHome = renderHome;
window.renderStats = renderStats;
window.renderApprovals = renderApprovals;
window.renderProfile = renderProfile;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.openEditProfileModal = openEditProfileModal;
window.selectPresetAvatar = selectPresetAvatar;
window.handleAvatarFileUpload = handleAvatarFileUpload;
window.randomizeNickname = randomizeNickname;
window.confirmSaveProfileAuth = confirmSaveProfileAuth;
window.switchTestIdentity = switchTestIdentity;
window.openApplyModal = openApplyModal;
window.closeApplyModal = closeApplyModal;
window.confirmSubmitApply = confirmSubmitApply;
window.openShareApprovalModal = openShareApprovalModal;
window.closeShareApprovalModal = closeShareApprovalModal;
window.sendToFriendsAction = sendToFriendsAction;
window.quickSimulateFriendJudgeModal = quickSimulateFriendJudgeModal;
window.closeHomeAlertNotification = closeHomeAlertNotification;
window.openCourtCaseModal = openCourtCaseModal;
window.closeCourtModal = closeCourtModal;
window.applyDecision = applyDecision;
window.confirmCloseCourtModal = confirmCloseCourtModal;
window.openCaseDetailModal = openCaseDetailModal;
window.closeCaseDetailModal = closeCaseDetailModal;
window.tapTomatoRibbon = tapTomatoRibbon;
window.triggerBotanicalRibbonBurst = triggerBotanicalRibbonBurst;
window.bloomReasonFlower = bloomReasonFlower;
window.setFlowerStage = setFlowerStage;
window.startFlowerRain = startFlowerRain;
window.stopFlowerRain = stopFlowerRain;
window.startFlowerPetals = startFlowerPetals;
window.stopFlowerPetals = stopFlowerPetals;
window.prevCalendarMonth = prevCalendarMonth;
window.nextCalendarMonth = nextCalendarMonth;
window.selectCalendarDay = selectCalendarDay;
window.checkAndShowHomeApprovalNotice = checkAndShowHomeApprovalNotice;
window.closeHomeApprovalNoticeModal = closeHomeApprovalNoticeModal;
window.goToApprovalDetailFromNotice = goToApprovalDetailFromNotice;
window.openRulesModal = openRulesModal;
window.closeRulesModal = closeRulesModal;

// 页面加载启动与环境自适应
function initApplication() {
  loadStateFromStorage();
  renderAll();

  // 检查首页是否有待展示的好友审批结果通知弹窗 (简洁弹窗告知结果，可点击直达案卷详情)
  setTimeout(() => {
    checkAndShowHomeApprovalNotice();
  }, 400);

  if (!currentUser || !currentUser.authorized) {
    setTimeout(() => {
      openAuthModal(false);
    }, 1000);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
