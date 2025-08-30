let doc = new jspdf.jsPDF();
doc.text(30, 30, 'Hello world TEXT');
const data = doc.output('datauristring');
document.getElementById('download-link').innerHTML = `<a href="${data}" download>Download PDF</a>`;
