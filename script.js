// --- ⚙️ KONTROL PANELİ (Buradaki sayıları değiştirebilirsin) ⚙️ ---
const ASIL_KISI_SAYISI = 10;
const YEDEK_KISI_SAYISI = 2;
const BEKLEME_SURESI = 3000; // Kutular arası 5 saniye heyecan payı (Milisaniye)
// ⚠️ E-TABLO CSV LİNKİNİ BURAYA YAPIŞTIR ⚠️
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrarvcI39Dzxu_vbEu4bS-CySMirs5ZvOKgGpD2Yt-2Tr4IVHaclHUBjMT8vLnnrKU09nk8n6uXCj5/pub?gid=509040422&single=true&output=csv'; 
// -----------------------------------------------------------------

const logoContainer = document.getElementById('logo-container');
const mainHeader = document.getElementById('main-header');
const mainTitle = document.getElementById('main-title');
const mainStage = document.getElementById('main-stage');
const startBtn = document.getElementById('start-btn');
const signature = document.getElementById('signature');
const refreshBtn = document.getElementById('refresh-btn');
const participantCounter = document.getElementById('participant-counter');
const toastMessage = document.getElementById('toast-message');
const raffleStage = document.getElementById('raffle-stage');
const asilContainer = document.getElementById('asil-container');
const yedekContainer = document.getElementById('yedek-container');

let participants = [];
let boxes = []; 

document.addEventListener('DOMContentLoaded', () => {
    createBoxes();
    fetchNames(); // Site açıldığı gibi ilk veriyi otomatik çeker
});

// 2. Kutuları Matematiksel Olarak Çizme
function createBoxes() {
    asilContainer.innerHTML = '';
    yedekContainer.innerHTML = '';
    boxes = [];

    for (let i = 1; i <= ASIL_KISI_SAYISI; i++) {
        createBoxHTML(asilContainer, `0${i}`.slice(-2), false);
    }
    for (let i = 1; i <= YEDEK_KISI_SAYISI; i++) {
        createBoxHTML(yedekContainer, `Y${i}`, true);
    }
}

function createBoxHTML(container, numberText, isYedek) {
    const div = document.createElement('div');
    div.className = `box ${isYedek ? 'yedek' : 'asil'}`;
    div.innerHTML = `
        <div class="box-number">${numberText}</div>
        <span class="name-text">?</span>
    `;
    container.appendChild(div);
    boxes.push(div);
}

// 3. Veri Çekme Motoru
async function fetchNames() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        
        const rows = data.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        const dataRows = rows.slice(1); 

        participants = dataRows.map(row => {
            const columns = row.split(',');
            return columns[1] ? columns[1].trim() : "";
        }).filter(name => name.length > 0);

        updateCounterUI();
    } catch (error) {
        console.error("Hata:", error);
        showToast("Bağlantı hatası!", "#ff4c4c");
    }
}

// 4. Sayaç Arayüzü Çakışma Önleyici
function updateCounterUI() {
    participantCounter.classList.add('hide'); // Sayacı gizle
    showToast(`${participants.length} kişi sisteme yüklendi!`, "#4ade80"); // Bildirimi ver

    setTimeout(() => {
        participantCounter.textContent = `${participants.length} Katılımcı`;
        participantCounter.classList.remove('hide'); // Bildirim bitince sayacı geri getir
    }, 3000); 
}

function showToast(text, color) {
    toastMessage.textContent = text;
    toastMessage.style.color = color;
    toastMessage.classList.add('show');
    setTimeout(() => toastMessage.classList.remove('show'), 3000);
}

refreshBtn.addEventListener('click', fetchNames);

function getRandomWinners(count) {
    let shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 5. Animasyon Motoru
async function animateBox(box, finalName, isYedek) {
    return new Promise((resolve) => {
        let duration = BEKLEME_SURESI;
        let interval = 40;
        let elapsed = 0;
        const span = box.querySelector('.name-text');

        box.classList.add('blur-text');
        
        let timer = setInterval(() => {
            span.textContent = participants[Math.floor(Math.random() * participants.length)] || "?";
            elapsed += interval;

            if (elapsed >= duration) {
                clearInterval(timer);
                box.classList.remove('blur-text');
                
                // Uzun İsim Zekası
                if (finalName.length > 16) span.classList.add('text-small');
                else span.classList.remove('text-small');

                span.textContent = finalName;
                box.classList.add(isYedek ? 'yedek-glow' : 'winner-glow');
                
                resolve();
            }
        }, interval);
    });
}

// Başla Butonu Tetiği
startBtn.addEventListener('click', async () => {
    const totalNeeded = ASIL_KISI_SAYISI + YEDEK_KISI_SAYISI;
    if (participants.length < totalNeeded) {
        alert(`Sistemde yeterli kişi yok. En az ${totalNeeded} kişi gerekli!`);
        return;
    }

    startBtn.classList.add('fade-out');
    setTimeout(() => { 
        startBtn.style.display = 'none'; 
        raffleStage.classList.add('visible'); 
    }, 400); 

    const winners = getRandomWinners(totalNeeded);

    // KUTULARI SIRAYLA (5 SN ARAYLA) ÇALIŞTIRAN DÖNGÜ
    for (let i = 0; i < boxes.length; i++) {
        const isYedek = boxes[i].classList.contains('yedek');
        await animateBox(boxes[i], winners[i], isYedek);
    }
});
