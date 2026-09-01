from pathlib import Path
import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak

root = Path(__file__).resolve().parents[1]
img_path = root / 'assets' / 'images' / 'photo_2_2026-09-01_22-05-57.jpg'
cv_page_1 = root / 'assets' / 'images' / 'photo_1_2026-09-01_22-11-09.jpg'
cv_page_2 = root / 'assets' / 'images' / 'photo_2_2026-09-01_22-11-09.jpg'
out_path = root / 'assets' / 'documents' / 'commercial-offer.pdf'
cv_out_path = root / 'assets' / 'documents' / 'aliya-cv.pdf'
qr_path = root / 'assets' / 'qr-code.png'
out_path.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
heading = ParagraphStyle('heading', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#2a2426'))
sub = ParagraphStyle('sub', parent=styles['BodyText'], fontName='Helvetica', fontSize=12, leading=18, textColor=colors.HexColor('#50494b'))
small = ParagraphStyle('small', parent=styles['BodyText'], fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#50494b'))
body = ParagraphStyle('body', parent=styles['BodyText'], fontName='Helvetica', fontSize=11, leading=16, textColor=colors.HexColor('#2a2426'))


def ensure_qr():
    qr = qrcode.QRCode(version=2, box_size=4, border=2)
    qr.add_data('https://kbmaxat.github.io/aliya/')
    qr.make(fit=True)
    image = qr.make_image(fill_color='black', back_color='white')
    image.save(qr_path)


def build_cv_pdf():
    doc = SimpleDocTemplate(str(cv_out_path), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
    story = []
    story.append(Paragraph('Алия Жакупова', heading))
    story.append(Paragraph('Психолог • арт-терапевт', sub))
    story.append(Paragraph('CV', body))
    story.append(Spacer(1, 6*mm))
    if cv_page_1.exists():
        story.append(Image(str(cv_page_1), width=160*mm, height=95*mm, kind='proportional'))
    story.append(PageBreak())
    if cv_page_2.exists():
        story.append(Image(str(cv_page_2), width=160*mm, height=95*mm, kind='proportional'))
    doc.build(story)


def build_pdf():
    doc = SimpleDocTemplate(str(out_path), pagesize=A4, leftMargin=22*mm, rightMargin=22*mm, topMargin=18*mm, bottomMargin=18*mm)
    story = []

    story.append(Paragraph('Алия Жакупова', heading))
    story.append(Paragraph('Психолог • Арт-терапевт', sub))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Коммерческое предложение для школ, команд и организаций', heading))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Мягкая психологическая поддержка, арт-терапия и безопасная работа с эмоциональным состоянием участников.', body))
    story.append(Spacer(1, 8*mm))
    if img_path.exists():
        story.append(Image(str(img_path), width=120*mm, height=75*mm, kind='proportional'))
    story.append(PageBreak())

    story.append(Paragraph('О специалисте', heading))
    story.append(Paragraph('Алия Жакупова — психолог и арт-терапевт, специалист по работе с эмоциональным напряжением, тревогой, выгоранием, внутренней перегрузкой и восстановлением чувства устойчивости. В работе сочетаются психологическая поддержка, безопасная коммуникация и творческие практики, которые помогают человеку легче встретиться со своими ощущениями и ресурсами.', body))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Образование: бакалавр педагогики и психологии<br/>Дополнительное обучение: курс по профилактике буллинга и суицидальных рисков в образовательной среде<br/>Направления: индивидуальная работа, арт-терапия, групповая поддержка, командные форматы, сопровождение школ и организаций.', body))
    story.append(PageBreak())

    program = [
        ['Этап', 'Длительность', 'Описание'],
        ['Знакомство и ощущение безопасности', '10–15 мин', 'Определение запроса, целей и внутреннего контекста участников.'],
        ['Погружение в тему', '10 мин', 'Создание атмосферы доверия и выстраивание смысла встречи.'],
        ['Арт-терапевтическая практика', '50–60 мин', 'Основная творческая работа через образ, материалы, символы и рефлексию.'],
        ['Осмысление и обсуждение', '20–25 мин', 'Формулировка чувств, наблюдений и новых ресурсов.'],
        ['Завершение и закрепление', '10–15 мин', 'Подведение итогов и обсуждение следующих шагов.'],
    ]
    table = Table(program, colWidths=[42*mm, 30*mm, 94*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d9b69f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('GRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#d5c7b9')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Paragraph('Формат работы', heading))
    story.append(table)
    story.append(PageBreak())

    story.append(Paragraph('Для кого подходит', heading))
    story.append(Paragraph('• школы и образовательные учреждения<br/>• команды и HR-подразделения<br/>• бизнес-среда и корпоративные группы<br/>• профессиональные сообщества<br/>• организации, где важно снизить напряжение и повысить качество общения', body))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph('Цели программы', heading))
    story.append(Paragraph('• снижение эмоционального напряжения<br/>• профилактика выгорания<br/>• укрепление доверия и совместной коммуникации<br/>• восстановление внутреннего ресурса<br/>• развитие безопасного пространства для самовыражения', body))
    story.append(PageBreak())

    package_rows = [
        ['Пакет', 'Формат', 'Стоимость', 'Что входит'],
        ['Старт', 'Индивидуальная сессия', '20 000 ₸', '1 встреча, работа с запросом, поддержка, закрепление ресурса.'],
        ['Акция', 'Индивидуальная сессия до конца года', '10 000 ₸', 'специальная цена при записи до конца года.'],
        ['Группа / мероприятие', 'От 1,5 до 2 часов', 'от 90 000 ₸', 'арт-терапия для команды, школы или группы участников.'],
    ]
    package_table = Table(package_rows, colWidths=[22*mm, 35*mm, 30*mm, 83*mm])
    package_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d8b0a3')),
        ('GRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#d5c7b9')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f4f0')]),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(Paragraph('Стоимость и условия', heading))
    story.append(package_table)
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('Итоговая стоимость зависит от количества участников, формата встречи, материалов и целей организации.', sub))
    story.append(PageBreak())

    story.append(Paragraph('Как заказать', heading))
    story.append(Paragraph('1. Вы оставляете заявку на сайте.<br/>2. Уточняется формат, цель и сроки.<br/>3. Подбирается подходящий формат работы.<br/>4. Проходит встреча или мероприятие.<br/>5. После работы выдаются ключевые выводы и рекомендации.', body))
    story.append(Spacer(1, 8*mm))
    ensure_qr()
    story.append(Image(str(qr_path), width=28*mm, height=28*mm, kind='proportional'))
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('Сайт: https://kbmaxat.github.io/aliya/', small))
    story.append(Paragraph('Email: zhakupovaal12@gmail.com', small))
    story.append(Paragraph('WhatsApp: +7 776 155 03 28', small))
    story.append(Paragraph('Instagram: https://www.instagram.com/_aliyaserikbaevna/', small))

    doc.build(story)


if __name__ == '__main__':
    build_cv_pdf()
    build_pdf()
    print(f'CV generated: {cv_out_path}')
    print(f'PDF generated: {out_path}')
