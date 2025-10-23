import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function hasUnsupportedColor(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = value.toLowerCase().trim();
    return (
        v.includes('lab(') ||
        v.includes('lch(') ||
        v.includes('oklab(') ||
        v.includes('oklch(') ||
        v.startsWith('color(')
    );
}

function sanitizeColorsDeep(root: HTMLElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const process = (el: Element) => {
        const cs: CSSStyleDeclaration = window.getComputedStyle(el);
        const style = (el as HTMLElement).style;

        // Check all possible color-related properties
        const colorProps = [
            'color',
            'background-color',
            'border-color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color',
            'outline-color',
            'text-decoration-color',
            'box-shadow',
            'background-image',
            'filter',
        ] as const;

        colorProps.forEach((prop) => {
            const val = cs.getPropertyValue(prop);
            if (hasUnsupportedColor(val)) {
                // Replace with safe fallback
                if (prop === 'color') style.setProperty(prop, '#000000');
                else if (prop === 'background-color') style.setProperty(prop, '#ffffff');
                else if (prop.includes('border') && prop.includes('color')) style.setProperty(prop, '#000000');
                else if (prop === 'outline-color') style.setProperty(prop, '#000000');
                else if (prop === 'text-decoration-color') style.setProperty(prop, '#000000');
                else if (prop === 'box-shadow') style.setProperty(prop, 'none');
                else if (prop === 'background-image') style.setProperty(prop, 'none');
                else if (prop === 'filter') style.setProperty(prop, 'none');
            }
        });

        // Also check inline styles
        const inlineStyle = style.cssText;
        if (hasUnsupportedColor(inlineStyle)) {
            // Clear problematic inline styles
            style.cssText = inlineStyle.replace(/lab\([^)]*\)/gi, '#000')
                .replace(/lch\([^)]*\)/gi, '#000')
                .replace(/oklab\([^)]*\)/gi, '#000')
                .replace(/oklch\([^)]*\)/gi, '#000')
                .replace(/color\([^)]*\)/gi, '#000');
        }
    };
    process(root);
    while (walker.nextNode()) {
        process(walker.currentNode as Element);
    }
}

export async function generateResumePDF(elementId: string, fileName: string) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Resume element not found');
    }

    // Create a clone to modify for PDF
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '210mm'; // A4 width
    clone.style.padding = '15mm';
    clone.style.backgroundColor = 'white';

    // Temporarily add to document for rendering
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    try {
        // Add a style reset to force safe colors
        const style = document.createElement('style');
        style.textContent = `
            * {
                color: #000000 !important;
                background-color: #ffffff !important;
                border-color: #000000 !important;
                outline-color: #000000 !important;
                text-decoration-color: #000000 !important;
                box-shadow: none !important;
                filter: none !important;
            }
        `;
        clone.appendChild(style);

        // Replace modern color functions with safe RGB fallbacks to prevent
        // html2canvas error: "Attempting to parse an unsupported color function \"lab\""
        sanitizeColorsDeep(clone);

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            removeContainer: true,
            foreignObjectRendering: false,
            backgroundColor: '#ffffff',
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(
            imgData,
            'PNG',
            imgX,
            imgY,
            imgWidth * ratio,
            imgHeight * ratio
        );

        pdf.save(fileName);
    } catch (error) {
        document.body.removeChild(clone);
        throw error;
    }
}