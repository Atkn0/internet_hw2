// script.js

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const adminInterface = document.getElementById('adminInterface');
    const userInterface = document.getElementById('userInterface');
    const seatingArrangement = document.getElementById('seatingArrangement');
    const resName = document.getElementById('resName');
    const resSurname = document.getElementById('resSurname');
    const resSeats = document.getElementById('resSeats');
    const resPrice = document.getElementById('resPrice');
    const rightPart = document.querySelector('.right-part');
    const confirmReservation = document.getElementById('confirmReservation');

    let currentUser = null;
    let seats = [];
    let selectedSeats = [];
    let cols = 0;

    function loadSeatingArrangement() {
        const storedSeats = localStorage.getItem('seatingArrangement');
        const storedCols = localStorage.getItem('seatingCols');
        if (storedSeats && storedCols) {
            seats = JSON.parse(storedSeats);
            cols = parseInt(storedCols);
            renderSeatingArrangement();
        } else {
            userInterface.classList.add('hidden');  // If no seating arrangement, hide user interface
        }
    }

    // Save seating arrangement to local storage
    function saveSeatingArrangement() {
        localStorage.setItem('seatingArrangement', JSON.stringify(seats));
        localStorage.setItem('seatingCols', cols.toString());
    }

    // Calculate ticket price based on age
    function calculateTicketPrice(age) {
        if (age >= 0 && age < 18) return 10;
        if (age >= 18 && age < 26) return 15;
        if (age >= 26 && age < 65) return 25;
        if (age >= 65) return 10;
        return 0; // Default case, in case the age is invalid
    }

    // Render seating arrangement
    function renderSeatingArrangement() {
        seatingArrangement.innerHTML = '';
        seatingArrangement.style.gridTemplateColumns = `repeat(${cols}, auto)`;
        userInterface.classList.remove('hidden');  // Show user interface if seats are available

        seats.forEach((seat, index) => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'seat';
            seatDiv.dataset.index = index;
            seatDiv.dataset.price = calculateTicketPrice(currentUser.age);
            seatDiv.textContent = index + 1; // Seat number

            if (seat.selected) {
                seatDiv.classList.add('selected');
            }

            seatDiv.addEventListener('click', () => {
                seat.selected = !seat.selected;
                if (seat.selected) {
                    seatDiv.classList.add('selected');
                    selectedSeats.push(index);
                } else {
                    seatDiv.classList.remove('selected');
                    selectedSeats = selectedSeats.filter(i => i !== index);
                }
                updateReservationDetails();
                saveSeatingArrangement();
            });

            seatDiv.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `Price: $${seatDiv.dataset.price}`;
                seatDiv.appendChild(tooltip);
            });

            seatDiv.addEventListener('mouseleave', () => {
                const tooltip = seatDiv.querySelector('.tooltip');
                if (tooltip) seatDiv.removeChild(tooltip);
            });

            seatingArrangement.appendChild(seatDiv);
        });
    }

    // Update reservation details in the right panel
    function updateReservationDetails() {
        resSeats.textContent = selectedSeats.map(index => index + 1).join(', ');
        const totalPrice = selectedSeats.reduce((sum, index) => sum + parseInt(document.querySelector(`.seat[data-index='${index}']`).dataset.price), 0);
        resPrice.textContent = `$${totalPrice}`;
    }

    // Handle form submission
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = userForm.name.value.trim();
        const surname = userForm.surname.value.trim();
        const email = userForm.email.value.trim();
        const phone = userForm.phone.value.trim();
        const age = parseInt(userForm.age.value.trim());

        currentUser = {
            name,
            surname,
            email,
            phone,
            age,
            role: email === 'admin@admin.com' ? 'admin' : 'user',
            ticketPrice: calculateTicketPrice(age)
        };

        if (currentUser.role === 'admin') {
            adminInterface.classList.remove('hidden');
        } else {
            adminInterface.classList.add('hidden');
            loadSeatingArrangement();
        }

        rightPart.classList.remove('hidden');
        resName.textContent = name;
        resSurname.textContent = surname;
    });

    // Handle seating arrangement setup by admin
    document.getElementById('setSeating').addEventListener('click', () => {
        const rows = parseInt(document.getElementById('rows').value);
        const colsInput = parseInt(document.getElementById('cols').value);
        seats = Array(rows * colsInput).fill().map((_, index) => ({ selected: false, number: index + 1 }));
        cols = colsInput;
        saveSeatingArrangement();
        renderSeatingArrangement();
    });

    // Confirm reservation
    confirmReservation.addEventListener('click', () => {
        if (currentUser && selectedSeats.length > 0) {
            alert(`Reservation confirmed for ${currentUser.name} ${currentUser.surname}. Seats: ${resSeats.textContent}, Total Price: ${resPrice.textContent}`);
        } else {
            alert('No seats selected.');
        }
    });

    // Load existing seating arrangement on page load
    loadSeatingArrangement();
});
