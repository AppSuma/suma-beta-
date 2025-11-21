
declare global {
    interface Window {
        jspdf: any;
        html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    }
}

const getFormattedDate = () => {
    const d = new Date();
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD}`;
};

const createPdfFromElement = async (element: HTMLElement) => {
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(element, { 
        scale: 2,
        useCORS: true, 
        backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
    }

    return pdf;
};

export const generatePdf = async (element: HTMLElement | null): Promise<void> => {
    if (!element) return;
    const fileName = `Reporte_Suma_${getFormattedDate()}.pdf`;
    const pdf = await createPdfFromElement(element);
    pdf.save(fileName);
};

export const generatePdfAsBlob = async (element: HTMLElement | null): Promise<{ blob: Blob, fileName: string } | null> => {
    if (!element) return null;
    const fileName = `Reporte_Suma_${getFormattedDate()}.pdf`;
    const pdf = await createPdfFromElement(element);
    const blob = pdf.output('blob');
    return { blob, fileName };
};
