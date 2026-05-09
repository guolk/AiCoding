import io
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    Image, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _setup_styles(self):
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=20,
            alignment=1,
            textColor=colors.HexColor('#1a365d')
        )
        
        self.section_style = ParagraphStyle(
            'SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=15,
            spaceAfter=10,
            textColor=colors.HexColor('#2c5282')
        )
        
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            leading=14
        )

    def generate(self, crystal_data, analysis_results, xrd_data=None):
        buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm
        )
        
        story = []
        
        story.append(Paragraph("晶体结构分析报告", self.title_style))
        story.append(Spacer(1, 0.5 * cm))
        
        story.append(self._build_metadata_section(crystal_data))
        story.append(Spacer(1, 0.5 * cm))
        
        story.append(self._build_lattice_section(crystal_data, analysis_results))
        story.append(Spacer(1, 0.5 * cm))
        
        story.append(self._build_atoms_section(crystal_data))
        story.append(Spacer(1, 0.5 * cm))
        
        story.append(self._build_symmetry_section(analysis_results))
        story.append(Spacer(1, 0.5 * cm))
        
        story.append(self._build_physical_properties_section(analysis_results))
        
        if xrd_data:
            story.append(Spacer(1, 0.5 * cm))
            story.append(self._build_xrd_section(xrd_data))
        
        story.append(Spacer(1, 1 * cm))
        story.append(Paragraph(
            "报告由在线晶体结构分析平台自动生成",
            ParagraphStyle('Footer', parent=self.styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer

    def _build_metadata_section(self, crystal_data):
        elements = []
        elements.append(Paragraph("一、基本信息", self.section_style))
        
        lattice = crystal_data.get('lattice', {})
        sg = crystal_data.get('space_group', {})
        
        data = [
            ['空间群', f"{sg.get('name', 'N/A')} (#{sg.get('number', 'N/A')})" if sg else 'N/A'],
            ['Hall符号', sg.get('hall_symbol', 'N/A') if sg else 'N/A'],
        ]
        
        table = Table(data, colWidths=[5 * cm, 10 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(table)
        return KeepTogether(elements)

    def _build_lattice_section(self, crystal_data, analysis_results):
        elements = []
        elements.append(Paragraph("二、晶胞参数", self.section_style))
        
        lattice = crystal_data.get('lattice', {})
        prop = analysis_results.get('physical_properties', {})
        anisotropy = prop.get('anisotropy', {})
        
        data = [
            ['参数', '数值', '单位'],
            ['a', f"{lattice.get('a', 'N/A'):.4f}" if lattice.get('a') else 'N/A', 'Å'],
            ['b', f"{lattice.get('b', 'N/A'):.4f}" if lattice.get('b') else 'N/A', 'Å'],
            ['c', f"{lattice.get('c', 'N/A'):.4f}" if lattice.get('c') else 'N/A', 'Å'],
            ['α', f"{lattice.get('alpha', 'N/A'):.2f}" if lattice.get('alpha') else 'N/A', '°'],
            ['β', f"{lattice.get('beta', 'N/A'):.2f}" if lattice.get('beta') else 'N/A', '°'],
            ['γ', f"{lattice.get('gamma', 'N/A'):.2f}" if lattice.get('gamma') else 'N/A', '°'],
            ['体积', f"{prop.get('volume', 'N/A'):.4f}" if prop.get('volume') else 'N/A', 'Å³'],
            ['晶系', anisotropy.get('crystal_system', 'N/A'), ''],
        ]
        
        table = Table(data, colWidths=[4 * cm, 6 * cm, 3 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        elements.append(table)
        return KeepTogether(elements)

    def _build_atoms_section(self, crystal_data):
        elements = []
        elements.append(Paragraph("三、原子坐标", self.section_style))
        
        atoms = crystal_data.get('atoms', [])
        
        data = [['序号', '原子', '元素', 'x', 'y', 'z', '占有率']]
        for i, atom in enumerate(atoms, 1):
            data.append([
                str(i),
                atom.get('label', ''),
                atom.get('element', ''),
                f"{atom.get('x', 0):.4f}",
                f"{atom.get('y', 0):.4f}",
                f"{atom.get('z', 0):.4f}",
                f"{atom.get('occupancy', 1.0):.2f}"
            ])
        
        if len(data) == 1:
            elements.append(Paragraph("无原子数据", self.normal_style))
            return KeepTogether(elements)
        
        table = Table(data, colWidths=[1.5 * cm, 2 * cm, 2 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        
        elements.append(table)
        return KeepTogether(elements)

    def _build_symmetry_section(self, analysis_results):
        elements = []
        elements.append(Paragraph("四、对称性分析", self.section_style))
        
        sym = analysis_results.get('symmetry', {})
        sg = sym.get('space_group', {})
        
        data = [
            ['点群', sym.get('point_group', 'N/A')],
            ['空间群', f"{sg.get('international_table', 'N/A')} (#{sg.get('number', 'N/A')})" if sg else 'N/A'],
            ['Hall符号', sg.get('hall_symbol', 'N/A') if sg else 'N/A'],
            ['对称操作数', str(len(sym.get('symmetry_operations', [])))],
        ]
        
        table = Table(data, colWidths=[5 * cm, 10 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(table)
        return KeepTogether(elements)

    def _build_physical_properties_section(self, analysis_results):
        elements = []
        elements.append(Paragraph("五、物理性质", self.section_style))
        
        prop = analysis_results.get('physical_properties', {})
        formula = prop.get('formula', {})
        
        data = [
            ['化学式', formula.get('formula', 'N/A')],
            ['化学式量', f"{formula.get('mass', 'N/A'):.2f} g/mol" if formula.get('mass') else 'N/A'],
            ['密度', f"{prop.get('density', 'N/A'):.4f} g/cm³" if prop.get('density') else 'N/A'],
            ['堆积密度', f"{prop.get('packing_density', 'N/A'):.4f}" if prop.get('packing_density') else 'N/A'],
            ['各向异性指数', f"{prop.get('anisotropy', {}).get('anisotropy_index', 'N/A'):.4f}" if prop.get('anisotropy', {}).get('anisotropy_index') is not None else 'N/A'],
        ]
        
        table = Table(data, colWidths=[5 * cm, 10 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(table)
        return KeepTogether(elements)

    def _build_xrd_section(self, xrd_data):
        elements = []
        elements.append(Paragraph("六、X射线衍射图谱", self.section_style))
        
        peaks = xrd_data.get('peaks', [])
        
        if not peaks:
            elements.append(Paragraph("无衍射峰数据", self.normal_style))
            return KeepTogether(elements)
        
        data = [['序号', '2θ (°)', '相对强度']]
        for i, peak in enumerate(peaks[:20], 1):
            data.append([
                str(i),
                f"{peak.get('angle', 0):.2f}",
                f"{peak.get('intensity', 0):.4f}"
            ])
        
        table = Table(data, colWidths=[2 * cm, 4 * cm, 4 * cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#ebf8ff')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        elements.append(table)
        elements.append(Paragraph(f"共检测到 {len(peaks)} 个衍射峰（显示前20个）", self.normal_style))
        return KeepTogether(elements)
