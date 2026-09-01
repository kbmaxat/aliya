from pathlib import Path
import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak

root = Path(__file__).resolve().parents[1]
img_path = root / 'photo_2_2026-09-01_22-05-57.jpg'
out_path = root / 'assets' / 'commercial-offer.pdf'
qr_path = root / 'assets' / 'qr-code.png'
out_path.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
heading = ParagraphStyle('heading', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#2a2426'))
sub = ParagraphStyle('sub', parent=styles['BodyText'], fontName='Helvetica', fontSize=12, leading=18, textColor=colors.HexColor('#50494b'))
small = ParagraphStyle('small', parent=styles['BodyText'], fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#50494b'))
body = ParagraphStyle('body', parent=styles['BodyText'], fontName='Helvetica', fontSize=11, leading=16, textColor=colors.HexColor('#2a2426'))


def ensure_qr():
    qr = qrcode.QRCode(version=2, box_size=4, border=2)
    qr.add_data('https://example.com/aliya-zhakupova')
    qr.make(fit=True)
    image = qr.make_image(fill_color='black', back_color='white')
    image.save(qr_path)


def build_pdf():
    doc = SimpleDocTemplate(str(out_path), pagesize=A4, leftMargin=22*mm, rightMargin=22*mm, topMargin=18*mm, bottomMargin=18*mm)
    story = []

    story.append(Paragraph('Алия Жакупова', heading))
    story.append(Paragraph('Психолог • Арт-терапевт', sub))
    story.append(Paragraph('Арт-терапия для команд, школ и организаций', heading))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('1,5–2 часа • безопасная индивидуальная атмосфера • творческая практика • рефлексия', body))
    story.append(Spacer(1, 10*mm))
    if img_path.exists():
        story.append(Image(str(img_path), width=120*mm, height=75*mm, kind='proportional'))
    story.append(PageBreak())

    story.append(Paragraph('О специалисте', heading))
    story.append(Paragraph('Алия Жакупова — психолог и арт-терапевт с образованием в области педагогики и психологии. Работа строится на сочетании психотерапевтической поддержки, безопасной коммуникации и творческих практик, которые помогают человеку лучше понимать свои ощущения, снижать внутреннее напряжение и укреплять ресурсную устойчивость.', body))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Образование: бакалавр педагогики и психологии<br/>Дополнительное обучение: профилактика буллинга и суицидальных рисков, арт-терапевтическая практика', body))
    story.append(PageBreak())

    program = [
        ['Этап', 'Длительность', 'Описание'],
        ['Знакомство и комфорт', '10 мин', 'Создание безопасной атмосферы и формулировка запроса.'],
        ['Введение в тему', '10 мин', 'Определение задачи, целей и ожиданий участников.'],
        ['Арт-терапевтическая практика', '50–60 мин', 'Основная творческая работа через образ, материалы и символы.'],
        ['Рефлексия', '20–25 мин', 'Осмысление переживаний, обсуждение ощущений и ресурсов.'],
        ['Завершение', '10–15 мин', 'Подведение итогов и закрепление впечатлений.'],
    ]
    table = Table(program, colWidths=[38*mm, 28*mm, 90*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0d4b3')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('GRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#d5c7b9')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('_PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(Paragraph('Что представляет собой программа', heading))
    story.append(table)
    story.append(PageBreak())

    story.append(Paragraph('Для кого', heading))
    story.append(Paragraph('• компании<br/>• HR-команды<br/>• образовательные учреждения<br/>• школы<br/>• университеты<br/>• государственные организации<br/>• НПО<br/>• профессиональные сообщества', body))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Возможные цели', heading))
    story.append(Paragraph('• эмоциональная разгрузка<br/>• профилактика выгорания<br/>• командное взаимодействие<br/>• развитие коммуникации<br/>• снижение напряжения<br/>• творческое переключение<br/>• повышение вовлечённости команды', body))
    story.append(PageBreak())

    package_rows = [
        ['Пакет', 'Участники', 'Стоимость', 'Что входит'],
        ['START', 'до 10', '90 000 ₸', '1,5 часа, арт-терапевтическая практика, групповая рефлексия, материалы.'],
        ['TEAM', 'до 20', '160 000 ₸', 'до 2 часов, персонализированная программа, материалы, рекомендации после мероприятия.'],
        ['CORPORATE', 'до 30', '225 000 ₸', 'до 2 часов, адаптация под запрос команды, несколько арт-практик, материалы, рекомендации.'],
    ]
    package_table = Table(package_rows, colWidths=[22*mm, 22*mm, 26*mm, 88*mm])
    package_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d8b0a3')),
        ('GRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#d5c7b9')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f4f0')]),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Paragraph('Пакеты', heading))
    story.append(package_table)
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Итоговая стоимость зависит от количества участников, формата, материалов и индивидуального запроса организации.', sub))
    story.append(PageBreak())

    story.append(Paragraph('Как заказать', heading))
    story.append(Paragraph('1. Организация отправляет заявку.<br/>2. Специалист уточняет задачу.<br/>3. Определяются формат, дата и количество участников.<br/>4. Согласовывается программа.<br/>5. Проводится мероприятие.', body))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Контакты: через форму записи на сайте / по актуальным контактам специалиста', sub))
    ensure_qr()
    story.append(Spacer(1, 8*mm))
    story.append(Image(str(qr_path), width=28*mm, height=28*mm, kind='proportional'))
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('Сайт: https://example.com/aliya-zhakupova', small))

    doc.build(story)


if __name__ == '__main__':
    build_pdf()
    print(f'PDF generated: {out_path}')
