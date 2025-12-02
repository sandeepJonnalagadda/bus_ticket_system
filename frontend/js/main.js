/* SmartBus – front-end connected to a backend API. */

// ---------- helpers ----------
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://bus-ticket-system-w7wd.onrender.com/api';
const fmtINR = (n) => new Intl.NumberFormat('en-IN').format(n);

// Helper for temporary data between pages
const sessionStore = {
  get: (k, d = null) => {
    try { return JSON.parse(sessionStorage.getItem(k)) ?? d; } catch { return d; }
  },
  set: (k, v) => sessionStorage.setItem(k, JSON.stringify(v)),
  del: (k) => sessionStorage.removeItem(k)
};

// ---------- auth helpers ----------
const getToken = () => localStorage.getItem('token');
const getAdminToken = () => localStorage.getItem('adminToken');

const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const adminAuthHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAdminToken()}`
});

async function syncNav() {
  const token = getToken();
  const navLogin = $('#nav-login');
  const navDash = $('#nav-dashboard');
  if (navLogin && navDash) {
    if (token) {
      navLogin.classList.add('hide');
      navDash.classList.remove('hide');
    } else {
      navLogin.classList.remove('hide');
      navDash.classList.add('hide');
    }
  }
}

// ---------- real QR generator ----------
function realQR(container, data) {
  if (container) {
    container.innerHTML = "";
    new QRCode(container, {
      text: data,
      width: 128,
      height: 128,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// =============================================================================
// MAIN APP INITIALIZATION
// =============================================================================
async function initializeApp() {
  syncNav();

  // ---------- index header year ----------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Home page: Real-time Tracking button ----------
  const homeTrackBtn = $('#homeTrackBtn');
  if (homeTrackBtn) {
    homeTrackBtn.addEventListener('click', () => {
      const id = prompt("Enter your Bus ID to track:");
      if (id && id.trim()) {
        location.href = `track.html?bid=${encodeURIComponent(id.trim())}`;
      }
    });
  }

  // ---------- register ----------
  const registerForm = $('#registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(registerForm);
      const name = fd.get('name').trim();
      const email = fd.get('email').trim().toLowerCase();
      const password = fd.get('password');

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          location.href = 'dashboard.html';
        } else {
          const err = await response.json();
          alert(`Registration failed: ${err.message}`);
        }
      } catch (error) {
        alert('Could not connect to the server. Please make sure it is running.');
      }
    });
  }

  // ---------- login ----------
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const email = fd.get('email').trim().toLowerCase();
      const password = fd.get('password');

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          location.href = 'dashboard.html';
        } else {
          alert('Invalid credentials');
        }
      } catch (error) {
        alert('Could not connect to the server. Please make sure it is running.');
      }
    });
  }

  // ---------- logout button ----------
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      location.href = 'index.html';
    });
  }

  // ---------- dashboard ----------
  if (location.pathname.endsWith('/dashboard.html')) {
    if (!getToken()) return location.href = 'login.html';
    
    const [userRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/users/profile`, { headers: authHeader() }),
        fetch(`${API_URL}/bookings/my-bookings`, { headers: authHeader() })
    ]);
    
    if(!userRes.ok || !bookingsRes.ok) {
        localStorage.removeItem('token');
        return location.href = 'login.html';
    }

    const user = await userRes.json();
    const bookings = await bookingsRes.json();
    
    $('#userName').textContent = user.name;
    
    const el = $('#upcomingList');
    if (!bookings.length) {
      el.innerHTML = `<p class="muted">No upcoming trips. <a href="search.html">Book now</a>.</p>`;
    } else {
      el.innerHTML = bookings.map(b => `
        <div class="card">
          <strong>${b.busId.name}</strong> • ${b.busId.from} → ${b.busId.to}
          <div class="muted">${b.busId.dep} → ${b.busId.arr} • ${b.busId.duration} • ${b.journeyDate}</div>
          <div>Seats: ${b.seats.join(', ')} • Fare: ₹${fmtINR(b.total)}</div>
          <div class="actions">
            <a class="btn" href="confirmation.html?bid=${b._id}">View Ticket</a>
            <a class="btn" href="track.html?bid=${b.busId._id}">Track Bus</a>
          </div>
        </div>
      `).join('');
    }
  }

  // ---------- history ----------
  if (location.pathname.endsWith('history.html')) {
    if (!getToken()) return location.href = 'login.html';
    
    const list = $('#historyList');
    
    async function renderHistory() {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, { headers: authHeader() });
        const bookings = await response.json();

        if (!bookings.length) {
            list.innerHTML = `<p class="muted">No bookings found in your history.</p>`;
        } else {
            list.innerHTML = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(b => `
                <div class="card">
                    <div><strong>${b.busId.from} → ${b.busId.to}</strong> • ${b.journeyDate}</div>
                    <div class="muted">${b.busId.name} • Seats: ${b.seats.join(', ')} • ₹${fmtINR(b.total)}</div>
                    <div style="font-weight: 700; margin-top: 5px;">Status: ${b.status}</div>
                    <div class="actions" style="margin-top: 10px;">
                        <a class="btn" href="confirmation.html?bid=${b._id}">View Ticket</a>
                        <a class="btn" href="track.html?bid=${b.busId._id}">Track Bus</a>
                        ${b.status === 'CONFIRMED' ? `<button class="btn" data-cancel-id="${b._id}">Cancel</button>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    list.addEventListener('click', async (e) => {
        const cancelBtn = e.target.closest('button[data-cancel-id]');
        if (cancelBtn) {
            if (!confirm('Are you sure you want to cancel this booking?')) return;
            
            const bookingId = cancelBtn.dataset.cancelId;
            const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: authHeader()
            });

            if (response.ok) {
                alert('Booking cancelled successfully.');
                await renderHistory(); // Re-render the list
            } else {
                alert('Failed to cancel booking.');
            }
        }
    });

    await renderHistory();
  }
  
  // ---------- profile page ----------
  if (location.pathname.endsWith('profile.html')) {
    if (!getToken()) return location.href = 'login.html';

    const profileForm = $('#profileForm');
    const pwdForm = $('#pwdForm');

    // Fetch and populate user data
    const response = await fetch(`${API_URL}/users/profile`, { headers: authHeader() });
    if(response.ok) {
        const user = await response.json();
        profileForm.name.value = user.name;
        profileForm.email.value = user.email;
    }

    // Handle password change
    pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(pwdForm);
        const currentPassword = fd.get('current');
        const newPassword = fd.get('next');
        const confirmPassword = fd.get('confirm');

        if (newPassword !== confirmPassword) {
            return alert('New passwords do not match.');
        }

        const passResponse = await fetch(`${API_URL}/users/profile/password`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (passResponse.ok) {
            alert('Password updated successfully!');
            pwdForm.reset();
        } else {
            const err = await passResponse.json();
            alert(`Error: ${err.message}`);
        }
    });
  }

  // ---------- search ----------
  const searchForm = $('#searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(searchForm);
      const q = new URLSearchParams({
        from: fd.get('from').trim(),
        to: fd.get('to').trim(),
        date: fd.get('date')
      });
      location.href = `results.html?${q.toString()}`;
    });
    const dateInput = document.getElementById('searchDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
  
  // ---------- results ----------
  if (location.pathname.endsWith('results.html')) {
    const params = new URLSearchParams(location.search);
    const from = params.get('from'), to = params.get('to'), date = params.get('date');
    $('#searchSummary').textContent = `${from} → ${to} on ${date}`;

    const response = await fetch(`${API_URL}/buses/search?from=${from}&to=${to}`);
    const buses = await response.json();
    
    const wrap = $('#resultsList');
    if (!buses.length) {
      wrap.innerHTML = `<p class="muted">No buses found. Try another route/date.</p>`;
    } else {
      wrap.innerHTML = buses.map(b => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <strong>${b.name}</strong> <span class="muted">(${b.type})</span><br/>
              <span class="muted">${b.operator}</span>
              <div class="muted">${b.dep} → ${b.arr} • ${b.duration}</div>
            </div>
            <div style="text-align:right">
              <div class="muted">From</div>
              <div style="font-size:20px;font-weight:700">₹${fmtINR(b.fare)}</div>
              <button class="btn primary" data-bus-id="${b._id}" data-bus-details='${JSON.stringify(b)}'>Select Seats</button>
            </div>
          </div>
        </div>
      `).join('');

      wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-bus-id]');
        if (!btn) return;
        sessionStore.set('selectedBus', JSON.parse(btn.dataset.busDetails));
        const q = new URLSearchParams({ busId: btn.dataset.busId, date });
        location.href = `seat-selection.html?${q.toString()}`;
      });
    }
  }

  // ---------- seat selection ----------
  if (location.pathname.endsWith('seat-selection.html')) {
    const params = new URLSearchParams(location.search);
    const busId = params.get('busId');
    const date = params.get('date');
    const bus = sessionStore.get('selectedBus');

    if (!bus) return location.href = 'search.html';
    
    $('#busTitle').textContent = `${bus.name} • ₹${fmtINR(bus.fare)}`;
    $('#busMeta').textContent = `${bus.from} → ${bus.to} • ${date} • ${bus.dep} → ${bus.arr}`;
    
    // NOTE: In a real app, you would fetch already booked seats for this specific date and bus.
    const grid = $('#seatGrid');
    for (let n = 1; n <= bus.seats; n++) {
      const div = document.createElement('div');
      div.className = 'seat';
      div.textContent = n;
      div.dataset.n = n;
      grid.appendChild(div);
    }
    
    const selected = new Set();
    grid.addEventListener('click', (e) => {
      const seat = e.target.closest('.seat');
      if (!seat || seat.classList.contains('booked')) return;
      const n = Number(seat.dataset.n);
      if (selected.has(n)) {
        selected.delete(n);
        seat.classList.remove('selected');
      } else {
        selected.add(n);
        seat.classList.add('selected');
      }
      $('#selectedSeats').textContent = selected.size;
      $('#fareTotal').textContent = fmtINR(selected.size * bus.fare);
      $('#proceedPassenger').disabled = selected.size === 0;
    });

    $('#proceedPassenger').addEventListener('click', () => {
      const q = new URLSearchParams({ busId, date, seats: [...selected].join(',') });
      location.href = `passenger-details.html?${q.toString()}`;
    });
  }
  
  // ---------- passenger details ----------
  if (location.pathname.endsWith('passenger-details.html')) {
    const params = new URLSearchParams(location.search);
    const busId = params.get('busId'), date = params.get('date');
    const seats = params.get('seats').split(',').map(Number);
    const bus = sessionStore.get('selectedBus');

    if (!bus || !seats.length) return location.href = 'search.html';
    
    const holder = $('#passengerList');
    seats.forEach((n,i)=>{
        const wrap = document.createElement('div');
        wrap.className = 'grid-3';
        wrap.innerHTML = `<label>Passenger ${i+1} (Seat ${n})<input name="pname_${n}" required placeholder="Full name"/></label><label>Age<input name="page_${n}" type="number" min="1" max="120" required/></label><label>Gender<select name="pgender_${n}" required><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label>`;
        holder.appendChild(wrap);
    });

    $('#passengerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const passengers = seats.map(n => ({
        seat: n,
        name: fd.get(`pname_${n}`).trim(),
        age: Number(fd.get(`page_${n}`)),
        gender: fd.get(`pgender_${n}`)
      }));
      
      const draft = {
        busId,
        journeyDate: date,
        seats,
        passengers,
        total: seats.length * bus.fare,
      };
      
      sessionStore.set('paymentDraft', draft);
      location.href = 'payment.html';
    });
  }

  // ---------- payment ----------
  if (location.pathname.endsWith('payment.html')) {
    if (!getToken()) return location.href = 'login.html';
    
    const draft = sessionStore.get('paymentDraft');
    const bus = sessionStore.get('selectedBus');
    if (!draft || !bus) return location.href = 'search.html';

    $('#paySummary').textContent =
      `${bus.name} • ${bus.from} → ${bus.to} • ${draft.journeyDate} • Seats: ${draft.seats.join(', ')} • Total: ₹${fmtINR(draft.total)}`;
      
    $('#paymentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(draft),
      });

      if (response.ok) {
        const booking = await response.json();
        sessionStore.del('paymentDraft');
        sessionStore.del('selectedBus');
        location.href = `confirmation.html?bid=${booking._id}`;
      } else {
        alert('Booking failed. Please try again.');
      }
    });
  }

  // ---------- confirmation ----------
  if (location.pathname.endsWith('confirmation.html')) {
    if (!getToken()) return location.href = 'login.html';
    
    const params = new URLSearchParams(location.search);
    const bid = params.get('bid');
    
    const response = await fetch(`${API_URL}/bookings/${bid}`, { headers: authHeader() });
    if (!response.ok) return (document.body.innerHTML = '<h1>Booking not found or not authorized.</h1>');
    
    const booking = await response.json();
    const bus = booking.busId;
    
    $('#ticketMeta').textContent = `${bus.from} → ${bus.to} • ${booking.journeyDate}`;
    $('#ticketDetails').innerHTML = `
      <div><strong>${bus.name}</strong> <span class="muted">(${bus.type})</span></div>
      <div class="muted">${bus.dep} → ${bus.arr} • ${bus.duration}</div>
      <div>Seats: ${booking.seats.join(', ')}</div>
      <div>Total: ₹${fmtINR(booking.total)}</div>
      <div>Status: ${booking.status}</div>
    `;
    $('#ticketPax').innerHTML = booking.passengers.map(p => `<li>${p.name}, ${p.age}, ${p.gender} (Seat ${p.seat})</li>`).join('');
    $('#ticketCode').textContent = booking._id;

    // Updated passengerInfo for more detailed QR Code
    const passengerNames = booking.passengers.map(p => p.name).join(', ');
    const passengerInfo = `Booking ID: ${booking._id}\nBus: ${bus.name}\nDate: ${booking.journeyDate}\nSeats: ${booking.seats.join(', ')}\nPassengers: ${passengerNames}`;
    realQR($('#qrBox'), passengerInfo);

    $('#trackBtn').addEventListener('click', () => {
      location.href = `track.html?bid=${bus._id}`;
    });

    $('#downloadTicket').addEventListener('click', () => {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${booking._id}.html`;
        a.click();
        URL.revokeObjectURL(url);
    });
  }
  
  // =============================================================================
  // ADMIN SECTION
  // =============================================================================
  
  // ---------- admin login/logout ----------
  const adminLoginForm = $('#adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(adminLoginForm);
      const email = fd.get('email').trim().toLowerCase();
      const password = fd.get('password');
      
      try {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('adminToken', data.token);
          location.href = 'admin-dashboard.html';
        } else {
          alert('Invalid admin credentials');
        }
      } catch (error) {
        alert('Could not connect to the server. Please make sure it is running.');
      }
    });
  }

  const adminLogoutBtn = $('#adminLogoutBtn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      location.href = 'admin-login.html';
    });
  }
  
  // ---------- admin dashboard ----------
  if (location.pathname.endsWith('admin-dashboard.html')) {
    if (!getAdminToken()) return location.href = 'admin-login.html';
    
    try {
      const [busesRes, bookingsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/buses`, { headers: adminAuthHeader() }),
        fetch(`${API_URL}/bookings`, { headers: adminAuthHeader() }),
        fetch(`${API_URL}/users`, { headers: adminAuthHeader() })
      ]);
      
      const buses = await busesRes.json();
      const bookings = await bookingsRes.json();
      const users = await usersRes.json();
      
      $('#countBuses').textContent = buses.length;
      $('#countBookings').textContent = bookings.length;
      $('#countUsers').textContent = users.length;
    } catch (error) {
      console.error("Failed to fetch admin dashboard stats:", error);
    }
  }
  
  // ---------- manage buses ----------
  if (location.pathname.endsWith('manage-buses.html')) {
    if (!getAdminToken()) return location.href = 'admin-login.html';
    const list = $('#busList');
    const form = $('#busForm');

    async function renderBuses() {
        const response = await fetch(`${API_URL}/buses`, { headers: adminAuthHeader() });
        const buses = await response.json();
        list.innerHTML = buses.map(b => `
            <div class="card">
                <div><strong>${b.name}</strong> (${b.operator}) - ${b.from} to ${b.to}</div>
                <div class="actions">
                    <button class="btn" data-bus='${JSON.stringify(b)}'>Edit</button>
                    <button class="btn" data-del-id="${b._id}">Delete</button>
                </div>
            </div>
        `).join('');
    }
    await renderBuses();
    
    list.addEventListener('click', async (e) => {
        // Handle Delete
        if (e.target.dataset.delId) {
            if (!confirm('Delete this bus?')) return;
            const id = e.target.dataset.delId;
            await fetch(`${API_URL}/buses/${id}`, {
                method: 'DELETE',
                headers: adminAuthHeader()
            });
            await renderBuses();
        }
        // Handle Edit
        if (e.target.dataset.bus) {
            const bus = JSON.parse(e.target.dataset.bus);
            form.id.value = bus._id;
            form.name.value = bus.name;
            form.type.value = bus.type;
            form.operator.value = bus.operator;
            form.from.value = bus.from;
            form.to.value = bus.to;
            form.dep.value = bus.dep;
            form.arr.value = bus.arr;
            form.duration.value = bus.duration;
            form.fare.value = bus.fare;
            form.seats.value = bus.seats;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const id = fd.get('id');
        const isEditing = !!id;
        const url = isEditing ? `${API_URL}/buses/${id}` : `${API_URL}/buses`;
        const method = isEditing ? 'PUT' : 'POST';
        const busData = {};
        for (const [key, value] of fd.entries()) {
            if (key !== 'id') busData[key] = value;
        }
        busData.fare = Number(busData.fare);
        busData.seats = Number(busData.seats);

        await fetch(url, {
            method: method,
            headers: adminAuthHeader(),
            body: JSON.stringify(busData)
        });
        
        form.reset();
        form.id.value = '';
        await renderBuses();
    });
  }

  // ---------- admin view bookings ----------
  if (location.pathname.endsWith('view-bookings.html')) {
    if (!getAdminToken()) return location.href = 'admin-login.html';
    const tbody = $('#adminBookingsBody');
    const response = await fetch(`${API_URL}/bookings`, { headers: adminAuthHeader() });
    const bookings = await response.json();
    
    if (tbody) {
      if (!bookings.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No bookings found.</td></tr>`;
      } else {
        tbody.innerHTML = bookings.map(b => {
          const user = b.userId || { name: 'N/A' };
          const bus = b.busId || { from: 'N/A', to: '' };
          return `<tr>
            <td>${b._id}</td>
            <td>${user.name}</td>
            <td>${bus.from} → ${bus.to}</td>
            <td>${b.journeyDate}</td>
            <td>${b.seats.join(', ')}</td>
            <td>₹${fmtINR(b.total)}</td>
            <td>${b.status}</td>
          </tr>`;
        }).join('');
      }
    }
  }
}

// ATTACH THE INITIALIZER TO THE DOM LOAD EVENT
document.addEventListener('DOMContentLoaded', initializeApp);

// -----------------------------------------------------------------------------
// GOOGLE MAPS - ANIMATED TRACKING LOGIC (API Version)
// -----------------------------------------------------------------------------
async function initMap() {
  const params = new URLSearchParams(location.search);
  const bid = params.get('bid');
  const mapDiv = document.getElementById('map');

  if (!bid) {
    if (mapDiv) mapDiv.innerHTML = '<p style="text-align:center; padding: 20px;">No Bus ID provided.</p>';
    return;
  }

  let busData;
  let journeyDate = '(Date not provided)';

  try {
    const busRes = await fetch(`${API_URL}/buses/${bid}`);
    if (busRes.ok) {
      busData = await busRes.json();
    } else {
      throw new Error('Bus not found');
    }
  } catch (error) {
    if (mapDiv) mapDiv.innerHTML = `<p style="text-align:center; padding: 20px;">Could not find a bus with ID: ${bid}</p>`;
    return;
  }


  $('#trackTitle').textContent = `Tracking • ${busData.name}`;
  $('#trackMeta').textContent = `${busData.from} → ${busData.to} • ${journeyDate}`;

  // Create an SVG for the bus icon to ensure it always loads
  const busIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" width="40px" height="40px" style="background-color: #007bff; border-radius: 50%; padding: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>`;
  
  const busIcon = document.createElement('div');
  busIcon.innerHTML = busIconSvg;


  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
  });

  const map = new Map(mapDiv, {
    zoom: 7,
    center: { lat: 17.3850, lng: 78.4867 },
    mapId: "SMARTBUS_ANIMATED_MAP"
  });
  directionsRenderer.setMap(map);

  directionsService.route({
    origin: busData.from,
    destination: busData.to,
    travelMode: google.maps.TravelMode.DRIVING,
  }, (result, status) => {
    if (status === "OK" && result.routes.length > 0) {
      directionsRenderer.setDirections(result);

      const path = result.routes[0].overview_path;
      const startLocation = path[0];
      
      const busMarker = new AdvancedMarkerElement({
        map,
        position: startLocation,
        content: busIcon,
        title: busData.name,
      });

      let step = 0;
      setInterval(() => {
        step = (step + 1) % path.length;
        const currentPosition = path[step];
        busMarker.position = currentPosition;
        map.panTo(currentPosition);
      }, 1500);

    } else {
      console.error(`Directions request failed due to ${status}`);
      mapDiv.innerHTML = '<p style="text-align:center; padding: 20px;">Could not retrieve the route for this trip. Please check if the Directions API is enabled.</p>';
    }
  });
}