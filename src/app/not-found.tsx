import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] via-[#181F17] to-[#232D1A] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Pagina Niet Gevonden</h1>
          <p className="text-xl text-gray-300 mb-8">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Ga naar Dashboard
          </Link>
          
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
            >
              Terug naar Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}