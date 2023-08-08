const booksList = document.querySelector('#booksList');
const searchInput = document.querySelector('#searchInput');
const searchButton = document.querySelector('#searchButton');
const loadMoreButton = document.querySelector('#loadMore');

const apiKey = 'AIzaSyDzujo4_qGrNHGwADcwQRenr0Ii3ceUGKs';

let startIndex = 0;

searchButton.addEventListener('click', stringSearch);
loadMoreButton.addEventListener('click', loadMoreBooks);

async function searchBooks(query, startIndex) {
  try {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&startIndex=${startIndex}`;
    console.log(apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Помилка під час завантаження даних.');
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
      console.error('Помилка при отриманні даних:', error);
      return [];
  }
}

function createBookCard(bookInfo) {
  const bookCard = document.createElement('div');
  bookCard.classList.add('book-card');
  bookCard.innerHTML = `
    <img src='${bookInfo.volumeInfo.imageLinks?.thumbnail || '/styles/no img.jpg'}' alt='${bookInfo.volumeInfo.title}'>
    <h2>${bookInfo.volumeInfo.title}</h2>
    <p>Автор: ${bookInfo.volumeInfo.authors ? bookInfo.volumeInfo.authors.join(', ') : 'Невідомий'}</p>
    <p>Рік випуску: ${bookInfo.volumeInfo.publishedDate || 'Невідомо'}</p>
  `;
  
  bookCard.addEventListener('click', () => {
    displayBookDetails(bookInfo);
    openModal();
  });
  
  return bookCard;
}

function openModal() {
  const modal = document.querySelector('#modal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.querySelector('#modal');
  modal.style.display = 'none';
}

document.querySelector('.close-button').addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
  const modal = document.querySelector('#modal');
  if (e.target === modal) {
    closeModal();
  }
});

function displayBookDetails(bookInfo) {
  const bookDetails = document.querySelector('#bookDetails');
  bookDetails.innerHTML = `
    <img src='${bookInfo.volumeInfo.imageLinks?.thumbnail || '/styles/no img.jpg'}' alt='${bookInfo.volumeInfo.title}'>
    <h2>${bookInfo.volumeInfo.title}</h2><br>
    <p>Автор: ${bookInfo.volumeInfo.authors ? bookInfo.volumeInfo.authors.join(', ') : 'Невідомий'}</p><br>
    <p>Рік випуску: ${bookInfo.volumeInfo.publishedDate || 'Невідомо'}</p><br>
    <p>Опис: ${bookInfo.volumeInfo.description || 'Відсутній'}</p>
  `;
}

async function displayBooks(query) {
  const books = await searchBooks(query, startIndex);
  loadMoreButton.style.display = 'none';

  booksList.innerHTML = '';

  books.forEach(book => {
    const bookCard = createBookCard(book);
    booksList.append(bookCard);
  });

  if (books.length >= 10) {
    loadMoreButton.style.display = 'block';
  } else {
      loadMoreButton.style.display = 'none';
    }
}

async function loadMoreBooks() {
  const query = searchInput.value.trim();
  startIndex += 10;
  const moreBooks = await searchBooks(query, startIndex);

  if (moreBooks.length === 0) {
    loadMoreButton.style.display = 'none';
    return;
  }

  moreBooks.forEach(book => {
    const bookCard = createBookCard(book);
    booksList.append(bookCard);
  });

  if (moreBooks.length >= 10) {
    loadMoreButton.style.display = 'block';
  } else {
      loadMoreButton.style.display = 'none';
    }
}

function showError(message) {
  const errorElement = document.querySelector('.error-message');
  errorElement.textContent = message;
  booksList.innerHTML = '';
}

async function stringSearch() {
  const query = searchInput.value.trim().toLowerCase();
  
  if (query !== '') {
    startIndex = 0;
    const books = await searchBooks(query, startIndex);
    const filteredBooks = books.filter(book => book.volumeInfo.title.toLowerCase().includes(query));
    
    if (filteredBooks.length === 0) {
      showError("На ваш запит нічого не знайдено!");
      loadMoreButton.style.display = 'none';
    } else {
      showError();
      displayBooks(query);
    }
  }
}

displayBooks();