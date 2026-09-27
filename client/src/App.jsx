import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faPlus,
  faMagnifyingGlass,
  faPen,
  faTrash,
  faXmark,
  faLayerGroup,
  faChartSimple,
  faDollarSign,
  faCalendar,
  faUser,
  faArrowTrendUp,
  faCircleCheck,
  faTriangleExclamation,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:5000/api/books";

const emptyForm = {
  title: "",
  author: "",
  genre: "",
  publishedYear: "",
  price: "",
};

function App() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const [editingBookId, setEditingBookId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setBooks(response.data.books);
    } catch (error) {
      console.error("GET BOOKS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchBooks();
}, []);

  const genres = useMemo(() => {
    const uniqueGenres = [
      ...new Set(books.map((book) => book.genre)),
    ];

    return ["All", ...uniqueGenres];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        book.title.toLowerCase().includes(searchValue) ||
        book.author.toLowerCase().includes(searchValue) ||
        book.genre.toLowerCase().includes(searchValue);

      const matchesGenre =
        selectedGenre === "All" ||
        book.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [books, search, selectedGenre]);

  const totalValue = useMemo(() => {
    return books.reduce(
      (total, book) => total + Number(book.price),
      0
    );
  }, [books]);

  const latestBook = books[0];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingBookId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
        publishedYear: Number(formData.publishedYear),
        price: Number(formData.price),
      };

      if (
        !bookData.title ||
        !bookData.author ||
        !bookData.genre ||
        !formData.publishedYear ||
        !formData.price
      ) {
        setError("Please complete all fields.");
        return;
      }

      if (editingBookId) {
        const response = await axios.put(
          `${API_URL}/${editingBookId}`,
          bookData
        );

        const updatedBook = response.data.book;

        setBooks((previous) =>
          previous.map((book) =>
            book._id === updatedBook._id
              ? updatedBook
              : book
          )
        );

        setMessage("Book updated successfully.");
      } else {
        const response = await axios.post(
          API_URL,
          bookData
        );

        setBooks((previous) => [
          response.data.book,
          ...previous,
        ]);

        setMessage("Book added successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("SAVE BOOK ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save book."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book._id);

    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      publishedYear: book.publishedYear,
      price: book.price,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      setDeletingBookId(bookId);
      setError("");
      setMessage("");

      await axios.delete(`${API_URL}/${bookId}`);

      setBooks((previous) =>
        previous.filter((book) => book._id !== bookId)
      );

      if (editingBookId === bookId) {
        resetForm();
      }

      setMessage("Book deleted successfully.");
    } catch (error) {
      console.error("DELETE BOOK ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete book."
      );
    } finally {
      setDeletingBookId(null);
    }
  };

  return (
    <div className="app">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <FontAwesomeIcon icon={faBook} />
          </div>

          <div>
            <h1>BookVault</h1>
            <span>Library Management</span>
          </div>
        </div>

      </header>

      <main className="container">
        <section className="hero">
          <div>
            <span className="eyebrow">
              <FontAwesomeIcon icon={faArrowTrendUp} />
              YOUR DIGITAL LIBRARY
            </span>

            <h2>
              Manage your
              <span> collection.</span>
            </h2>

            <p>
              Organize books, track your collection,
              and keep your library beautifully structured.
            </p>
          </div>

          <div className="hero-stat">
            <FontAwesomeIcon icon={faBook} />
            <strong>{books.length}</strong>
            <span>Books in library</span>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>

            <div>
              <span>Total Books</span>
              <strong>{books.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FontAwesomeIcon icon={faChartSimple} />
            </div>

            <div>
              <span>Genres</span>
              <strong>{genres.length - 1}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>

            <div>
              <span>Collection Value</span>
              <strong>
                ₦{totalValue.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <FontAwesomeIcon icon={faCalendar} />
            </div>

            <div>
              <span>Latest Addition</span>
              <strong>
                {latestBook
                  ? latestBook.publishedYear
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="form-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  COLLECTION
                </span>

                <h3>
                  {editingBookId
                    ? "Edit book"
                    : "Add a new book"}
                </h3>
              </div>

              <div className="heading-icon">
                <FontAwesomeIcon
                  icon={
                    editingBookId
                      ? faPen
                      : faPlus
                  }
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Book title</label>

                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faBook} />

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Atomic Habits"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Author</label>

                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faUser} />

                  <input
                    type="text"
                    name="author"
                    placeholder="e.g. James Clear"
                    value={formData.author}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Genre</label>

                  <div className="input-wrapper">
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                    />

                    <input
                      type="text"
                      name="genre"
                      placeholder="e.g. Self Help"
                      value={formData.genre}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Published year</label>

                  <div className="input-wrapper">
                    <FontAwesomeIcon
                      icon={faCalendar}
                    />

                    <input
                      type="number"
                      name="publishedYear"
                      placeholder="2024"
                      value={formData.publishedYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Price</label>

                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faDollarSign} />

                  <input
                    type="number"
                    name="price"
                    placeholder="12000"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  <FontAwesomeIcon
                    icon={
                      editingBookId
                        ? faPen
                        : faPlus
                    }
                  />

                  {saving
                    ? "Saving..."
                    : editingBookId
                    ? "Update Book"
                    : "Add Book"}
                </button>

                {editingBookId && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetForm}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="library-panel">
            <div className="library-header">
              <div>
                <span className="panel-label">
                  YOUR LIBRARY
                </span>

                <h3>Book collection</h3>
              </div>

              <span className="book-count">
                {filteredBooks.length} results
              </span>
            </div>

            <div className="filters">
              <div className="search-box">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                />

                <input
                  type="text"
                  placeholder="Search books, authors..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <select
                value={selectedGenre}
                onChange={(event) =>
                  setSelectedGenre(event.target.value)
                }
              >
                {genres.map((genre) => (
                  <option
                    value={genre}
                    key={genre}
                  >
                    {genre === "All"
                      ? "All genres"
                      : genre}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <div className="alert success">
                <FontAwesomeIcon icon={faCircleCheck} />
                {message}
              </div>
            )}

            {error && (
              <div className="alert error">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                />
                {error}
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="loading-icon">
                  <FontAwesomeIcon icon={faRotate} spin />
                </div>

                <h4>Loading your library...</h4>
                <p>Please wait while we fetch your books.</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faBook} />
                </div>

                <h4>No books found</h4>

                <p>
                  {books.length === 0
                    ? "Start building your collection by adding your first book."
                    : "Try changing your search or genre filter."}
                </p>
              </div>
            ) : (
              <div className="books-grid">
                {filteredBooks.map((book) => (
                  <article
                    className="book-card"
                    key={book._id}
                  >
                    <div className="book-cover">
                      <FontAwesomeIcon icon={faBook} />

                      <span>
                        {book.genre}
                      </span>
                    </div>

                    <div className="book-content">
                      <div className="book-top">
                        <span className="year">
                          {book.publishedYear}
                        </span>

                        <span className="price">
                          ₦
                          {Number(
                            book.price
                          ).toLocaleString()}
                        </span>
                      </div>

                      <h4>{book.title}</h4>

                      <p className="author">
                        <FontAwesomeIcon
                          icon={faUser}
                        />
                        {book.author}
                      </p>

                      <div className="card-actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(book)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faPen}
                          />
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(book._id)
                          }
                          disabled={
                            deletingBookId ===
                            book._id
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                          />

                          {deletingBookId ===
                          book._id
                            ? "Deleting"
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <FontAwesomeIcon icon={faBook} />
        <span>BookVault</span>
        <small>Built with MERN</small>
      </footer>
    </div>
  );
}

export default App;