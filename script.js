document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const table = document.getElementById('wordsTable');
    const loadingRow = document.getElementById('loadingRow');
    const noResults = document.getElementById('noResults');
    const shuffleButton = document.getElementById('shuffleButton');

    let wordsData = [];
    let currentSort = { column: null, direction: 'asc' };

    async function fetchData() {
        try {
            const response = await fetch('dictionary_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            wordsData = await response.json();
            renderTable(wordsData);
            loadingRow.style.display = 'none';
        } catch (error) {
            console.error("Failed to fetch or parse words data:", error);
            loadingRow.innerHTML = `<td colspan="3" class="p-8 text-center text-red-500">Не удалось загрузить данные. Пожалуйста, попробуйте обновить страницу.</td>`;
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            table.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }
        
        table.classList.remove('hidden');
        noResults.classList.add('hidden');

        data.forEach(entry => {
            const row = document.createElement('tr');
            // Обрабатываем примеры: заменяем точку с пробелом на перенос строки
            const formattedExamples = entry.examples.replace(/\. /g, '.\n');
            row.innerHTML = `
                <td class="p-2 sm:p-4 align-top text-sm sm:text-base font-medium">${entry.word}</td>
                <td class="p-2 sm:p-4 align-top text-sm sm:text-base">${entry.translation}</td>
                <td class="p-2 sm:p-4 align-top text-gray-600 text-xs sm:text-sm">${formattedExamples}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function filterData(query) {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = wordsData.filter(entry => 
            entry.word.toLowerCase().includes(lowerCaseQuery)
        );
        renderTable(sortData(filtered));
    }

    function sortData(data) {
        if (!currentSort.column) {
            return data;
        }
        
        const key = currentSort.column === 'english' ? 'word' : 'translation';

        const sortedData = [...data].sort((a, b) => {
            const valA = a[key].toLowerCase();
            const valB = b[key].toLowerCase();
            return valA.localeCompare(valB, ['en', 'ru']);
        });

        if (currentSort.direction === 'desc') {
            sortedData.reverse();
        }
        
        return sortedData;
    }

    function updateSortIcons() {
        document.querySelectorAll('#wordsTable th[data-column]').forEach(th => {
            const sortIconContainer = th.querySelector('.sort-icon');
            if (!sortIconContainer) return;
            const column = th.dataset.column;

            if (column === currentSort.column) {
                th.setAttribute('data-sort-dir', currentSort.direction);
                sortIconContainer.innerHTML = currentSort.direction === 'asc' 
                    ? '<i data-lucide="chevron-up" class="text-blue-500"></i>' 
                    : '<i data-lucide="chevron-down" class="text-blue-500"></i>';
            } else {
                th.removeAttribute('data-sort-dir');
                sortIconContainer.innerHTML = '<i data-lucide="chevrons-up-down" class="text-gray-400"></i>';
            }
        });
        lucide.createIcons();
    }

    // Функция для перемешивания массива (алгоритм Фишера-Йетса)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Функция для перемешивания слов
    function shuffleWords() {
        // Сбрасываем сортировку
        currentSort = { column: null, direction: 'asc' };
        updateSortIcons();
        
        // Перемешиваем данные
        const shuffledData = shuffleArray(wordsData);
        renderTable(shuffledData);
    }
    
    searchInput.addEventListener('input', (e) => {
        filterData(e.target.value);
    });

    document.querySelectorAll('#wordsTable th[data-column]').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            updateSortIcons();
            filterData(searchInput.value);
        });
    });

    // Обработчик для кнопки перемешивания
    shuffleButton.addEventListener('click', () => {
        // Очищаем поле поиска
        searchInput.value = '';
        shuffleWords();
    });

    fetchData();
    updateSortIcons();
});
