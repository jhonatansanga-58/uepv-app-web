export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 — No autorizado</h1>
        <p className="text-gray-700 mb-6">No tienes permisos para ver esta página.</p>
        <a href="/login" className="text-primary-600 underline">Iniciar sesión</a>
      </div>
    </div>
  );
}
