class Tour {
    constructor(country, duration, price) {
        this.country = country;
        this.duration = duration;
        this.price = price;
    }
}

let tours = []; 
let filteredTours = []; 

fetch(`http://127.0.0.1:8080/api/tours`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch tours data");
        }
        return response.json();
    })
    .then(data => {
        tours = data; 
        filteredTours = [...tours]; 
        renderTours(); 
    })
    .catch(error => console.error("Error fetching tours:", error));


document.getElementById('tour-form')?.addEventListener('submit', handleSubmitTourForm);

function handleSubmitTourForm(e) {
    e.preventDefault();
    const country = document.getElementById('country').value.trim();
    const duration = parseInt(document.getElementById('duration').value, 10);
    const price = parseFloat(document.getElementById('price').value);

    let isValid = validateTourForm(country, duration, price);

    if (isValid) {
        const tour = new Tour(country, duration, price);
        tours.push(tour);
        fetch('http://127.0.0.1:8080/api/tours', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tour)
        })
        .then(response => {
            if (response.ok) {
                console.log("Tour saved successfully");
            } else {
                console.error("Failed to save tour");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
        window.location.href = 'tourism.html';
    }
}

function validateTourForm(country, duration, price) {
    let isValid = true;
    document.querySelectorAll('.error-msg').forEach(el => el.remove());
    

    if (duration <= 0) {
        const errorMsg = document.createElement('span');
        errorMsg.classList.add('error-msg');
        errorMsg.style.color = 'red';
        errorMsg.innerText = 'Duration must be greater than 0 days.';
        document.getElementById('duration').parentElement.appendChild(errorMsg);
        isValid = false;
    }

    if (price <= 0) {
        const errorMsg = document.createElement('span');
        errorMsg.classList.add('error-msg');
        errorMsg.style.color = 'red';
        errorMsg.innerText = 'Price must be greater than 0 EUR.';
        document.getElementById('price').parentElement.appendChild(errorMsg);
        isValid = false;
    }

    return isValid;
}

function renderTours(tourArray = tours) {
    const tourList = document.getElementById('tour-list');
    if (tourList) {
        tourList.innerHTML = '';
        tourArray.forEach((tour, index) => {
            tourList.innerHTML += `
                <div class="tour">
                    <h3>${tour.country}</h3>
                    <p>Duration: ${tour.duration} days</p>
                    <p>Price: ${tour.price} EUR</p>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editTour(${index}, '${tour.country}')">Edit</button>
                        <button class="remove-btn" onclick="removeTour(${index})">Remove</button>
                    </div>
                </div>
            `;
        });
    }
}

function removeTour(index) {
    const removedTour = tours.splice(index, 1)[0];
    fetch(`http://127.0.0.1:8080/api/tours/${removedTour.country}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete tour");
        }
    })
    .catch(error => console.error("Error:", error));
    filteredTours = [...tours];
    renderTours(filteredTours);
}

function sortToursByPrice() {
    filteredTours.sort((a, b) => b.price - a.price);
    renderTours(filteredTours);
}

function totalToursPrice() {
    const total = filteredTours.reduce((sum, tour) => sum + parseFloat(tour.price), 0);
    document.getElementById('total-expenses').innerText = total.toFixed(2);
}

function editTour(index, country) {
    const tourIndex = tours.findIndex(tour => tour.country === country);
    if (tourIndex !== -1) {
        window.location.href = `edit.html?id=${tourIndex}`;
    }
}

function searchTours() {
    const query = document.getElementById('searchQuery').value.trim().toLowerCase();
    filteredTours = tours.filter(tour =>
        tour.country.toLowerCase().includes(query)
    );
    renderTours(filteredTours);
}

function clearSearch() {
    document.getElementById('searchQuery').value = '';
    filteredTours = [...tours];
    renderTours(filteredTours);
}

document.getElementById('searchBtn')?.addEventListener('click', function () {
    searchTours();
});

document.getElementById('clearBtn')?.addEventListener('click', function () {
    clearSearch();
});

renderTours();
