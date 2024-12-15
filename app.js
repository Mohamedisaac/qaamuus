// Load the dictionary JSON file
let dictionary = [];
fetch('dictionary.json')
    .then(response => response.json())
    .then(data => dictionary = data)
    .catch(error => console.error('Error loading dictionary:', error));

// Search function
function searchWord() {
    const query = document.getElementById('search').value.toLowerCase();

    // Advanced Search: Allow partial matches
    const results = dictionary.filter(entry => entry.english.toLowerCase().includes(query));

    const resultDiv = document.getElementById('result');
    if (results.length > 0) {
        // Create HTML to display all matches
        resultDiv.innerHTML = results.map(result => `
            <div class="entry">
                <h3> - ${result.english}</h3>
                <p><b>Maaddada:</b> ${result.maaddada}</p>
                <p><b>Somali:</b> ${result.soomaali}</p>
            </div>
        `).join('');
    } else {
        resultDiv.innerHTML = `<p>Ereygan kuma jiro!</p>`;
    }
}

// Add event listener for Enter key
const searchInput = document.getElementById('search');
searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchWord();
    }
});
