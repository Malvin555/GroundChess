type GamePageProps = {
  params: { id: string };
};

export default function GamePage({ params }: GamePageProps) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Game ID: {params.id}</h1>
      <p className="text-gray-600">Game board coming soon...</p>
    </div>
  );
}
