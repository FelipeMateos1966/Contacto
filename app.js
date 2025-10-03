document.addEventListener('DOMContentLoaded', () => {
    const selectContactBtn = document.getElementById('select-contact-btn');
    const manualFormContainer = document.getElementById('manual-form-container');
    const manualForm = document.getElementById('manual-form');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const statusMessage = document.getElementById('status-message');

    const contactPickerSupported = 'contacts' in navigator && 'ContactsManager' in window;

    if (contactPickerSupported) {
        selectContactBtn.addEventListener('click', pickContact);
        manualFormContainer.classList.add('hidden');
        selectContactBtn.classList.remove('hidden');
    } else {
        statusMessage.textContent = 'La API de Contactos no es compatible. Por favor, introduce los datos manualmente.';
        manualFormContainer.classList.remove('hidden');
        selectContactBtn.classList.add('hidden');
    }

    manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = {
            name: [e.target.name.value],
            email: [e.target.email.value],
            tel: [e.target.tel.value]
        };
        if (contact.name[0]) {
            generateQrCodeFromContact(contact);
        } else {
            statusMessage.textContent = 'El nombre es obligatorio.';
        }
    });

    async function pickContact() {
        try {
            const contacts = await navigator.contacts.select(['name', 'email', 'tel'], { multiple: false });
            if (contacts.length > 0) {
                statusMessage.textContent = '';
                generateQrCodeFromContact(contacts[0]);
            } else {
                statusMessage.textContent = 'No se seleccionó ningún contacto.';
            }
        } catch (error) {
            statusMessage.textContent = 'Error al seleccionar el contacto.';
            console.error(error);
        }
    }

    function generateVCard(contact) {
        const name = contact.name?.[0] || '';
        const email = contact.email?.[0] || '';
        const tel = contact.tel?.[0] || '';

        let vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}`;
        if (email) {
            vCard += `\nEMAIL:${email}`;
        }
        if (tel) {
            vCard += `\nTEL;TYPE=CELL:${tel}`;
        }
        vCard += `\nEND:VCARD`;
        return vCard;
    }

    function generateQrCodeFromContact(contact) {
        const vCardString = generateVCard(contact);
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: vCardString,
            width: 256,
            height: 256,
            colorDark: "#ffffff",
            colorLight: "#1D2430",
            correctLevel: QRCode.CorrectLevel.H
        });
        qrCodeContainer.style.display = 'flex';
        statusMessage.textContent = '¡Código QR generado!';
    }
});