export function generateItineraryDoc(itinerary: any): string {
  const {
    title = '行程表',
    employeeName = '',
    department = '',
    startDate = '',
    endDate = '',
    purpose = '',
    destinations = [],
    flights = [],
    hotels = [],
    meetings = []
  } = itinerary;

  const destinationsHtml = destinations.length > 0
    ? `
    <div class="section">
      <h3>目的地</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>城市</th>
            <th>到达日期</th>
            <th>离开日期</th>
          </tr>
        </thead>
        <tbody>
          ${destinations.map((d: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${d.city || ''}</td>
              <td>${d.arrivalDate || ''}</td>
              <td>${d.departureDate || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`
    : '';

  const flightsHtml = flights.length > 0
    ? `
    <div class="section">
      <h3>航班信息</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>航班号</th>
            <th>出发地</th>
            <th>目的地</th>
            <th>出发时间</th>
            <th>到达时间</th>
          </tr>
        </thead>
        <tbody>
          ${flights.map((f: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${f.flightNo || ''}</td>
              <td>${f.departure || ''}</td>
              <td>${f.destination || ''}</td>
              <td>${f.departureTime || ''}</td>
              <td>${f.arrivalTime || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`
    : '';

  const hotelsHtml = hotels.length > 0
    ? `
    <div class="section">
      <h3>酒店信息</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>酒店名称</th>
            <th>城市</th>
            <th>入住日期</th>
            <th>退房日期</th>
          </tr>
        </thead>
        <tbody>
          ${hotels.map((h: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${h.name || ''}</td>
              <td>${h.city || ''}</td>
              <td>${h.checkIn || ''}</td>
              <td>${h.checkOut || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`
    : '';

  const meetingsHtml = meetings.length > 0
    ? `
    <div class="section">
      <h3>会议安排</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>日期</th>
            <th>时间</th>
            <th>地点</th>
            <th>会议主题</th>
            <th>参会人员</th>
          </tr>
        </thead>
        <tbody>
          ${meetings.map((m: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.date || ''}</td>
              <td>${m.time || ''}</td>
              <td>${m.location || ''}</td>
              <td>${m.topic || ''}</td>
              <td>${m.attendees || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1890ff; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #1890ff; margin-bottom: 10px; }
    .header .subtitle { color: #666; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .info-item { display: flex; }
    .info-label { font-weight: bold; color: #555; width: 80px; }
    .info-value { flex: 1; }
    .section { margin-bottom: 30px; }
    .section h3 { color: #1890ff; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e8e8e8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #d9d9d9; padding: 12px; text-align: left; font-size: 14px; }
    th { background: #1890ff; color: white; font-weight: bold; }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #e6f7ff; }
    .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e8e8e8; padding-top: 20px; }
    @media print {
      body { padding: 20px; }
      .header h1 { font-size: 24px; }
      th { background: #1890ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">商务出行行程单</div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">员工姓名:</span>
      <span class="info-value">${employeeName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">部门:</span>
      <span class="info-value">${department}</span>
    </div>
    <div class="info-item">
      <span class="info-label">开始日期:</span>
      <span class="info-value">${startDate}</span>
    </div>
    <div class="info-item">
      <span class="info-label">结束日期:</span>
      <span class="info-value">${endDate}</span>
    </div>
    <div class="info-item" style="grid-column: span 2;">
      <span class="info-label">出行目的:</span>
      <span class="info-value">${purpose}</span>
    </div>
  </div>

  ${destinationsHtml}
  ${flightsHtml}
  ${hotelsHtml}
  ${meetingsHtml}

  <div class="footer">
    <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    <p>本行程单由系统自动生成</p>
  </div>
</body>
</html>`;
}

export function generateReimbursementDoc(reimbursement: any, expenses: any[]): string {
  const {
    title = '报销单',
    employeeName = '',
    department = '',
    reimbursementNo = '',
    applicationDate = '',
    travelStartDate = '',
    travelEndDate = '',
    purpose = '',
    approver = ''
  } = reimbursement;

  const totalAmount = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

  const expensesHtml = expenses.length > 0
    ? `
    <div class="section">
      <h3>费用明细</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>费用类型</th>
            <th>日期</th>
            <th>描述</th>
            <th>金额 (元)</th>
            <th>票据号</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map((e: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${e.type || ''}</td>
              <td>${e.date || ''}</td>
              <td>${e.description || ''}</td>
              <td style="text-align: right;">${(e.amount || 0).toFixed(2)}</td>
              <td>${e.receiptNo || ''}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align: right; font-weight: bold;">合计:</td>
            <td style="text-align: right; font-weight: bold; color: #cf1322;">¥${totalAmount.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #52c41a; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #52c41a; margin-bottom: 10px; }
    .header .subtitle { color: #666; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f6ffed; padding: 20px; border-radius: 8px; border: 1px solid #b7eb8f; }
    .info-item { display: flex; }
    .info-label { font-weight: bold; color: #555; width: 100px; }
    .info-value { flex: 1; }
    .section { margin-bottom: 30px; }
    .section h3 { color: #52c41a; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e8e8e8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #d9d9d9; padding: 12px; text-align: left; font-size: 14px; }
    th { background: #52c41a; color: white; font-weight: bold; }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #f6ffed; }
    .total-row { background: #fff7e6 !important; }
    .total-row td { font-size: 16px; }
    .signature-section { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
    .signature-item { text-align: center; }
    .signature-line { border-bottom: 1px solid #333; margin-bottom: 10px; height: 60px; }
    .signature-label { font-weight: bold; }
    .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e8e8e8; padding-top: 20px; }
    @media print {
      body { padding: 20px; }
      .header h1 { font-size: 24px; }
      th { background: #52c41a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">商务出行费用报销单</div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">报销单号:</span>
      <span class="info-value">${reimbursementNo}</span>
    </div>
    <div class="info-item">
      <span class="info-label">申请日期:</span>
      <span class="info-value">${applicationDate}</span>
    </div>
    <div class="info-item">
      <span class="info-label">员工姓名:</span>
      <span class="info-value">${employeeName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">部门:</span>
      <span class="info-value">${department}</span>
    </div>
    <div class="info-item">
      <span class="info-label">出差开始:</span>
      <span class="info-value">${travelStartDate}</span>
    </div>
    <div class="info-item">
      <span class="info-label">出差结束:</span>
      <span class="info-value">${travelEndDate}</span>
    </div>
    <div class="info-item" style="grid-column: span 2;">
      <span class="info-label">报销事由:</span>
      <span class="info-value">${purpose}</span>
    </div>
  </div>

  ${expensesHtml}

  <div class="signature-section">
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">申请人签字</div>
      <div>日期: ___________</div>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">审批人签字</div>
      <div>日期: ___________</div>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <div class="signature-label">财务审核</div>
      <div>日期: ___________</div>
    </div>
  </div>

  <div class="footer">
    <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    <p>本报销单由系统自动生成</p>
  </div>
</body>
</html>`;
}
