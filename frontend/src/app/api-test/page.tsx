import { testCMSConnection } from '@/lib/test-api'
import { payload } from '@/lib/api'

async function testData() {
  try {
    const connectionTest = await testCMSConnection()
    const tripsData = await payload.getTrips()
    
    return { connectionTest, tripsData }
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionTest: null,
      tripsData: null
    }
  }
}

export default async function APITestPage() {
  const { connectionTest, tripsData, error } = await testData()
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-8 text-foreground">API Connection Test</h1>
        
        {error && (
          <div className="mb-8 p-4 bg-destructive text-destructive-foreground rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid gap-8">
          <div className="bg-card p-6 rounded-xl">
            <h2 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Connection Test</h2>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(connectionTest, null, 2)}
            </pre>
          </div>
          
          <div className="bg-card p-6 rounded-xl">
            <h2 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Trips Data</h2>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(tripsData, null, 2)}
            </pre>
          </div>
          
          {tripsData && typeof tripsData === 'object' && 'docs' in tripsData && Array.isArray((tripsData as {docs: unknown[]}).docs) ? (
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-2xl font-heading font-bold mb-4 text-card-foreground">Trips Preview</h2>
              <div className="grid gap-4">
                {((tripsData as {docs: {id: string, title: string, description: string, country?: {name: string}, period?: string}[]}).docs).slice(0, 3).map((trip) => (
                  <div key={trip.id} className="border border-border rounded p-4">
                    <h3 className="text-xl font-bold text-primary">{trip.title}</h3>
                    <p className="text-muted-foreground">{trip.description}</p>
                    <div className="mt-2 text-sm text-secondary">
                      {trip.country?.name || 'Unknown'} • {trip.period || 'No period set'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}