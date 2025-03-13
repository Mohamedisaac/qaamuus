let db;
let hasLoadedMansuur = false;

// Load SQLite Database
async function loadDB() {
    const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}` });
    const response = await fetch("dictionary.db");
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));

    loadSubjects();
}

// Switch Tabs
function showTab(tab) {
    document.getElementById("search-tab").style.display = tab === "search" ? "block" : "none";
    document.getElementById("subjects-tab").style.display = tab === "subjects" ? "block" : "none";
}

// Get all table names dynamically
function getTableNames() {
    let res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"); 
    return res.length > 0 ? res[0].values.map(row => row[0]) : [];
}

// Search Function (only in 'ereyga' column)
function searchWord() {
    let query = document.getElementById("search-input").value.trim();
    let resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";

    if (query.length === 0) return;

    let tables = getTableNames();
    let normalTables = tables.filter(table => table !== "Soomaali_Mansuur");

    // Load smaller tables first
    normalTables.forEach(table => searchTable(table, query));

    // Load Soomaali_Mansuur later if needed
    setTimeout(() => {
        if (!hasLoadedMansuur) {
            searchTable("Soomaali_Mansuur", query);
            hasLoadedMansuur = true;
        }
    }, 2000); // Delay loading Mansuur by 2 seconds
}

// Helper function to search a single table
function searchTable(table, query) {
    let resultsContainer = document.getElementById("search-results");
    let res = db.exec(`SELECT ereyga, micnaha FROM "${table}" WHERE ereyga LIKE ?`, [`%${query}%`]);
    if (res.length > 0) {
        res[0].values.forEach(row => {
            let li = document.createElement("li");
            li.textContent = `[${table}] ${row[0]}: ${row[1]}`;
            resultsContainer.appendChild(li);
        });
    }
}

// Load Subjects in Dropdown
function loadSubjects() {
    let subjectSelect = document.getElementById("subject-select");
    subjectSelect.innerHTML = `<option value="">Dooro Qaamuus...</option>`;

    let tables = getTableNames();
    let normalTables = tables.filter(table => table !== "Soomaali_Mansuur");

    // Load smaller tables first
    normalTables.forEach(table => addSubjectOption(table));

    // Load Soomaali_Mansuur after a delay of 4 seconds
    setTimeout(() => {
        addSubjectOption("Soomaali_Mansuur");
    }, 4000);
}

// Helper function to add subjects to dropdown
function addSubjectOption(table) {
    let subjectSelect = document.getElementById("subject-select");
    let option = document.createElement("option");
    option.value = table;
    option.textContent = table;
    subjectSelect.appendChild(option);
}

// Load Entries for Selected Subject
function loadSubject() {
    let subject = document.getElementById("subject-select").value;
    let resultsContainer = document.getElementById("subject-entries");
    resultsContainer.innerHTML = "";

    if (!subject) return;

    let res = db.exec(`SELECT ereyga, micnaha FROM "${subject}"`);
    if (res.length > 0) {
        res[0].values.forEach(row => {
            let li = document.createElement("li");
            li.textContent = `${row[0]}: ${row[1]}`;
            resultsContainer.appendChild(li);
        });
    }
}

// Load Database on Startup
loadDB();

// Add About Modal functions
function showAbout() {
    document.querySelector('.modal-overlay').style.display = 'flex';
}

function hideAbout() {
    document.querySelector('.modal-overlay').style.display = 'none';
}

// Add event listener for the about button
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.about-btn').addEventListener('click', showAbout);
    
    // Close modal when clicking outside
    document.querySelector('.modal-overlay').addEventListener('click', hideAbout);
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideAbout();
    });
});
