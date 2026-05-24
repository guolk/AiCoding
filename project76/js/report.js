let currentTheme = 'warm';
let selectedTheme = 'warm';

const themeGradients = {
    warm: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    blue: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    green: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    pink: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
};

const themeColors = {
    warm: { primary: '#fcb69f', secondary: '#ffecd2', text: '#4a3728' },
    blue: { primary: '#a8edea', secondary: '#fed6e3', text: '#1e3a5f' },
    green: { primary: '#96e6a1', secondary: '#d4fc79', text: '#14532d' },
    pink: { primary: '#ff9a9e', secondary: '#fecfef', text: '#831843' }
};

function initReportModule() {
    const child = getCurrentChild();
    const now = new Date();
    const startDate = new Date(child.birthday);
    
    document.getElementById('reportStartDate').value = formatDate(startDate);
    document.getElementById('reportEndDate').value = formatDate(now);
    document.getElementById('albumTitle').textContent = `${child.name}的成长相册`;
    document.getElementById('albumDate').textContent = `${startDate.getFullYear()} - ${now.getFullYear()}`;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTheme = btn.dataset.theme;
            updateAlbumPreview();
        });
    });
    
    document.querySelectorAll('#reportOptions input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateAlbumPreview);
    });
    
    document.getElementById('reportStartDate').addEventListener('change', updateAlbumPreview);
    document.getElementById('reportEndDate').addEventListener('change', updateAlbumPreview);
    
    updateAlbumPreview();
}

function updateAlbumPreview() {
    const child = getCurrentChild();
    const cover = document.querySelector('.album-cover');
    cover.className = `album-cover theme-${selectedTheme}`;
    document.getElementById('albumTitle').textContent = `${child.name}的成长相册`;
    
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        document.getElementById('albumDate').textContent = `${start.getFullYear()} - ${end.getFullYear()}`;
    }
}

async function generatePDFReport() {
    const child = getCurrentChild();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const colors = themeColors[selectedTheme];
    
    showToast('正在生成PDF，请稍候...', 'success');
    
    const includePhotos = document.getElementById('includePhotos').checked;
    const includeMilestones = document.getElementById('includeMilestones').checked;
    const includeGrowth = document.getElementById('includeGrowth').checked;
    const includeLearning = document.getElementById('includeLearning').checked;
    const includeActivities = document.getElementById('includeActivities').checked;
    const includeHealth = document.getElementById('includeHealth').checked;
    
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    let currentY = margin;
    
    doc.setFillColor(252, 182, 159);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFillColor(255, 236, 210);
    doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 5, 5, 'F');
    
    doc.setFontSize(36);
    doc.setTextColor(74, 55, 40);
    doc.text(`${child.name}的成长相册`, pageWidth / 2, 80, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(120, 90, 70);
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    doc.text(`${startYear} - ${endYear}`, pageWidth / 2, 100, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`出生日期: ${formatDateCN(child.birthday)}`, pageWidth / 2, 130, { align: 'center' });
    doc.text(`当前年龄: ${calculateAge(child.birthday)}`, pageWidth / 2, 140, { align: 'center' });
    doc.text(`性别: ${child.gender === 'boy' ? '男孩' : '女孩'}`, pageWidth / 2, 150, { align: 'center' });
    
    doc.addPage();
    currentY = margin;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    if (includeMilestones && child.milestones.length > 0) {
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('🏆 里程碑事件', margin + 5, currentY + 8);
        currentY += 20;
        
        const filteredMilestones = child.milestones.filter(m => 
            m.date >= startDate && m.date <= endDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        filteredMilestones.forEach(m => {
            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(colors.text);
            doc.text(`${m.icon} ${m.title}`, margin, currentY);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`  ${formatDateCN(m.date)} (${calculateAgeAtDate(child.birthday, m.date)})`, margin + 20, currentY + 6);
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            
            const splitDesc = doc.splitTextToSize(m.description, pageWidth - 2 * margin - 10);
            doc.text(splitDesc, margin + 10, currentY + 14);
            
            currentY += 14 + splitDesc.length * 5 + 8;
            
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, currentY - 4, pageWidth - margin, currentY - 4);
        });
        
        currentY += 10;
    }
    
    if (includeGrowth && child.growthData.length > 0) {
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = margin;
        }
        
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('📊 发育数据', margin + 5, currentY + 8);
        currentY += 20;
        
        const filteredGrowth = child.growthData.filter(d => 
            d.date >= startDate && d.date <= endDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text('日期', margin, currentY);
        doc.text('年龄', margin + 35, currentY);
        doc.text('身高(cm)', margin + 65, currentY);
        doc.text('体重(kg)', margin + 100, currentY);
        doc.text('头围(cm)', margin + 135, currentY);
        currentY += 7;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 5;
        
        filteredGrowth.forEach(d => {
            if (currentY > pageHeight - 20) {
                doc.addPage();
                currentY = margin;
            }
            
            doc.setTextColor(60, 60, 60);
            doc.text(formatDateCN(d.date), margin, currentY);
            doc.text(`${calculateMonths(child.birthday, d.date)}个月`, margin + 35, currentY);
            doc.text(String(d.height), margin + 65, currentY);
            doc.text(String(d.weight), margin + 100, currentY);
            doc.text(String(d.head), margin + 135, currentY);
            currentY += 7;
        });
        
        currentY += 10;
    }
    
    if (includePhotos && child.photos.length > 0) {
        const filteredPhotos = child.photos.filter(p => 
            p.date >= startDate && p.date <= endDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (filteredPhotos.length > 0) {
            doc.addPage();
            currentY = margin;
            
            doc.setFillColor(colors.primary);
            doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.text('📸 成长照片', margin + 5, currentY + 8);
            currentY += 20;
            
            const imgWidth = 55;
            const imgHeight = 55;
            const cols = 3;
            const gap = 8;
            
            for (let i = 0; i < filteredPhotos.length; i++) {
                if (currentY + imgHeight > pageHeight - 20) {
                    doc.addPage();
                    currentY = margin;
                }
                
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = margin + col * (imgWidth + gap);
                const y = currentY + row * (imgHeight + gap + 15);
                
                try {
                    doc.setDrawColor(colors.primary);
                    doc.setLineWidth(2);
                    doc.roundedRect(x, y, imgWidth, imgHeight, 3, 3, 'S');
                    
                    doc.setFillColor(245, 245, 245);
                    doc.roundedRect(x + 2, y + 2, imgWidth - 4, imgHeight - 4, 2, 2, 'F');
                    
                    doc.setFontSize(10);
                    doc.setTextColor(colors.text);
                    doc.text(filteredPhotos[i].caption, x + imgWidth / 2, y + imgHeight + 12, { align: 'center' });
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(formatDateCN(filteredPhotos[i].date), x + imgWidth / 2, y + imgHeight + 17, { align: 'center' });
                } catch (e) {
                    console.log('Error adding image:', e);
                }
                
                if ((i + 1) % cols === 0) {
                    currentY = y + imgHeight + 25;
                }
            }
        }
    }
    
    if (includeLearning && child.scores.length > 0) {
        doc.addPage();
        currentY = margin;
        
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('📚 学习记录', margin + 5, currentY + 8);
        currentY += 20;
        
        const filteredScores = child.scores.filter(s => 
            s.date >= startDate && s.date <= endDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (filteredScores.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            
            const avgScore = (filteredScores.reduce((sum, s) => sum + s.score, 0) / filteredScores.length).toFixed(1);
            doc.text(`平均分数: ${avgScore}分`, margin, currentY);
            currentY += 10;
            
            doc.setFontSize(10);
            doc.text('日期', margin, currentY);
            doc.text('科目', margin + 30, currentY);
            doc.text('类型', margin + 55, currentY);
            doc.text('分数', margin + 90, currentY);
            doc.text('排名', margin + 120, currentY);
            currentY += 7;
            
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 5;
            
            filteredScores.forEach(s => {
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = margin;
                }
                
                doc.setTextColor(s.score >= 90 ? 16 : s.score >= 80 ? 245 : 239,
                               s.score >= 90 ? 185 : s.score >= 80 ? 158 : 68,
                               s.score >= 90 ? 129 : s.score >= 80 ? 11 : 68);
                doc.text(formatDateCN(s.date), margin, currentY);
                doc.setTextColor(60, 60, 60);
                doc.text(s.subject, margin + 30, currentY);
                doc.text(s.type, margin + 55, currentY);
                doc.setTextColor(s.score >= 90 ? 16 : s.score >= 80 ? 245 : 239,
                               s.score >= 90 ? 185 : s.score >= 80 ? 158 : 68,
                               s.score >= 90 ? 129 : s.score >= 80 ? 11 : 68);
                doc.text(String(s.score), margin + 90, currentY);
                doc.setTextColor(60, 60, 60);
                doc.text(`第${s.rank}名`, margin + 120, currentY);
                currentY += 7;
            });
        }
        
        currentY += 15;
        
        if (child.books.filter(b => b.status === '已读').length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(colors.text);
            doc.text('📖 阅读书目', margin, currentY);
            currentY += 10;
            
            const readBooks = child.books.filter(b => 
                b.status === '已读' && 
                (!b.date || b.date >= startDate) && 
                (!b.date || b.date <= endDate)
            );
            
            readBooks.forEach(b => {
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = margin;
                }
                
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                doc.text(`• ${b.title} - ${b.author} (${b.rating}星)`, margin + 5, currentY);
                currentY += 6;
            });
        }
    }
    
    if (includeActivities && child.parentActivities.filter(a => a.status === 'completed').length > 0) {
        doc.addPage();
        currentY = margin;
        
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('👨‍👩‍👧 亲子活动', margin + 5, currentY + 8);
        currentY += 20;
        
        const filteredActivities = child.parentActivities.filter(a => 
            a.status === 'completed' &&
            a.date >= startDate && 
            a.date <= endDate
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        filteredActivities.forEach(a => {
            if (currentY > pageHeight - 30) {
                doc.addPage();
                currentY = margin;
            }
            
            doc.setFontSize(11);
            doc.setTextColor(colors.text);
            doc.text(`${a.photo} ${a.title}`, margin, currentY);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`  ${formatDateCN(a.date)}`, margin + 5, currentY + 6);
            
            const splitDesc = doc.splitTextToSize(a.description, pageWidth - 2 * margin - 10);
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(splitDesc, margin + 10, currentY + 14);
            
            currentY += 14 + splitDesc.length * 5 + 8;
            
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, currentY - 4, pageWidth - margin, currentY - 4);
        });
    }
    
    if (includeHealth && (child.vaccines.length > 0 || child.medicalRecords.length > 0)) {
        doc.addPage();
        currentY = margin;
        
        doc.setFillColor(colors.primary);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('💉 健康记录', margin + 5, currentY + 8);
        currentY += 20;
        
        if (child.vaccines.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(colors.text);
            doc.text('疫苗接种', margin, currentY);
            currentY += 8;
            
            const completedVaccines = child.vaccines.filter(v => 
                v.status === 'completed' &&
                v.date >= startDate && 
                v.date <= endDate
            ).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            
            completedVaccines.forEach(v => {
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = margin;
                }
                
                doc.text(`✓ ${v.name} - ${formatDateCN(v.date)}`, margin + 5, currentY);
                currentY += 6;
            });
            
            currentY += 10;
        }
        
        if (child.medicalRecords.length > 0) {
            const filteredMedical = child.medicalRecords.filter(m => 
                m.date >= startDate && 
                m.date <= endDate
            ).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (filteredMedical.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(colors.text);
                doc.text('就医记录', margin, currentY);
                currentY += 8;
                
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                
                filteredMedical.forEach(m => {
                    if (currentY > pageHeight - 20) {
                        doc.addPage();
                        currentY = margin;
                    }
                    
                    doc.text(`🏥 ${m.illness} - ${formatDateCN(m.date)}`, margin + 5, currentY);
                    currentY += 6;
                });
            }
        }
    }
    
    doc.addPage();
    doc.setFillColor(252, 182, 159);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFillColor(255, 236, 210);
    doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 5, 5, 'F');
    
    doc.setFontSize(28);
    doc.setTextColor(74, 55, 40);
    doc.text('成长路上', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    doc.text('感恩有你', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(120, 90, 70);
    doc.text(`爱你的爸爸妈妈`, pageWidth / 2, pageHeight / 2 + 45, { align: 'center' });
    doc.text(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月`, pageWidth / 2, pageHeight / 2 + 65, { align: 'center' });
    
    doc.save(`${child.name}_成长相册_${formatDate(new Date())}.pdf`);
    
    showToast('PDF生成成功！', 'success');
}
