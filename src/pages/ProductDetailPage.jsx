import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function ProductDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container section">
        <div className="max-w-2xl mx-auto">
          <div className="card card-lg text-center">
            <div className="py-3xl">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h1 className="mb-md">Under Construction</h1>
              <p className="text-secondary mb-xl text-lg">
                This page is currently under development. Please check back later.
              </p>
              <p className="text-sm text-tertiary mb-xl">
                Product ID: {id}
              </p>
              <Link to="/productos" className="btn btn-secondary">
                Volver a Productos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetailPage;
