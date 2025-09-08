from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)

# ---------- Database Connection ----------
def get_db_connection():
    return psycopg2.connect(
        host="127.0.0.1",
        database="postgres",
        user="postgres",
        password="password"
    )

# ---------- Create Tables if not exists ----------
def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        model VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price_per_day NUMERIC(10,2) NOT NULL,
        available BOOLEAN DEFAULT TRUE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        car_id INT REFERENCES cars(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Booked'
    );
    """)

    conn.commit()
    cur.close()
    conn.close()

create_tables()

# ------------------ Admin APIs ------------------
@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("SELECT * FROM admins WHERE email=%s AND password=%s", (email, password))
    admin = cur.fetchone()

    cur.close()
    conn.close()

    if admin:
        return jsonify({"message": "Admin login successful", "admin_id": admin["id"]})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/admin/add", methods=["POST"])
def add_admin():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO admins (name, email, password) VALUES (%s, %s, %s)", (name, email, password))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "New admin added successfully"})
    except psycopg2.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400

@app.route("/admin/add_car", methods=["POST"])
def add_car():
    data = request.json
    model = data.get("model")
    brand = data.get("brand")
    price_per_day = data.get("price_per_day")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO cars (model, brand, price_per_day) VALUES (%s, %s, %s)", (model, brand, price_per_day))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Car added successfully"})

@app.route("/admin/bookings", methods=["GET"])
def view_all_bookings():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT b.id, c.name AS customer_name, c.mobile AS customer_mobile, car.model, car.brand, b.start_date, b.end_date, b.status
        FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        JOIN cars car ON b.car_id = car.id
    """)
    bookings = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(row) for row in bookings])

@app.route("/admin/cancel_booking/<int:booking_id>", methods=["PUT"])
def cancel_booking(booking_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE bookings SET status='Cancelled' WHERE id=%s", (booking_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": f"Booking {booking_id} cancelled"})

@app.route("/admin/complete_booking/<int:booking_id>", methods=["PUT"])
def complete_booking(booking_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE bookings SET status='Completed' WHERE id=%s", (booking_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": f"Booking {booking_id} marked as Completed"})

# ------------------ Customer APIs ------------------
@app.route("/customer/register", methods=["POST"])
def register_customer():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    mobile = data.get("mobile")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO customers (name, email, password, mobile) VALUES (%s, %s, %s, %s)", (name, email, password, mobile))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Customer registered successfully"})
    except psycopg2.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400

@app.route("/customer/login", methods=["POST"])
def customer_login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT * FROM customers WHERE email=%s AND password=%s", (email, password))
    customer = cur.fetchone()
    cur.close()
    conn.close()

    if customer:
        return jsonify({"message": "Customer login successful", "customer_id": customer["id"], "mobile": customer["mobile"]})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/customer/rent", methods=["POST"])
def rent_car():
    data = request.json
    customer_id = data.get("customer_id")
    car_id = data.get("car_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO bookings (customer_id, car_id, start_date, end_date) VALUES (%s, %s, %s, %s)",
                (customer_id, car_id, start_date, end_date))
    cur.execute("UPDATE cars SET available=FALSE WHERE id=%s", (car_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Car rented successfully"})

@app.route("/customer/bookings/<int:customer_id>", methods=["GET"])
def view_customer_bookings(customer_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT b.id, car.model, car.brand, b.start_date, b.end_date, b.status
        FROM bookings b
        JOIN cars car ON b.car_id = car.id
        WHERE b.customer_id = %s
    """, (customer_id,))
    bookings = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(row) for row in bookings])

@app.route("/cars", methods=["GET"])
def get_cars():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("SELECT * FROM cars")
    cars = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(row) for row in cars])

@app.route("/customer/cancel_booking/<int:booking_id>", methods=["PUT"])
def customer_cancel_booking(booking_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE bookings SET status = 'Canceled by Customer' WHERE id = %s", (booking_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Booking canceled by customer"})

@app.route("/cars_with_bookings", methods=["GET"])
def get_cars_with_bookings():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""
        SELECT cars.*, 
            COALESCE(json_agg(
                json_build_object(
                    'start_date', b.start_date, 
                    'end_date', b.end_date,
                    'status', b.status
                )
            ) FILTER (WHERE b.id IS NOT NULL), '[]') AS bookings
        FROM cars
        LEFT JOIN bookings b ON cars.id = b.car_id AND b.status = 'Booked'
        GROUP BY cars.id
    """)
    cars = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(row) for row in cars])

# ------------------ Frontend Route ------------------
@app.route('/')
def home():
    return "Hello from Flask on Render!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)