import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    const trips = await payload.find({
        collection: 'trips',
        limit: 1000,
        pagination: false,
        req,
    })

    for (const trip of trips.docs) {
        let modified = false
        const newItinerary = (trip.itinerary || []).map((block: any) => {
            let blockModified = false
            const newBlock = { ...block }

            // Check activities field
            if (typeof newBlock.activities === 'string') {
                newBlock.activities = convertToLexical(newBlock.activities)
                blockModified = true
            }

            // Check FullDay description (if it was somehow affected, though schema says textarea but let's be safe if it was mixed up)
            // Actually schema says description is textarea, so string is fine.
            // But let's check for any other RichText fields.

            // FullDay: accommodation.notes (if any - complex path), personalNotes (RichText)
            if (newBlock.blockType === 'fullDay') {
                if (typeof newBlock.personalNotes === 'string') {
                    newBlock.personalNotes = convertToLexical(newBlock.personalNotes)
                    blockModified = true
                }
                // summary is RichText
                if (typeof newBlock.summary === 'string') {
                    newBlock.summary = convertToLexical(newBlock.summary)
                    blockModified = true
                }
            }

            // Waypoint: tips (RichText)
            if (newBlock.blockType === 'waypoint') {
                if (typeof newBlock.tips === 'string') {
                    newBlock.tips = convertToLexical(newBlock.tips)
                    blockModified = true
                }
            }

            if (blockModified) {
                modified = true
                return newBlock
            }
            return block
        })

        if (modified) {
            payload.logger.info(`Migrating Lexical fields for trip: ${trip.title}`)
            await payload.update({
                collection: 'trips',
                id: trip.id,
                data: {
                    itinerary: newItinerary,
                },
                req,
            })
        }
    }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // No down migration
}

function convertToLexical(content: string) {
    return {
        root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
                {
                    type: 'paragraph',
                    format: '',
                    indent: 0,
                    version: 1,
                    children: [
                        {
                            type: 'text',
                            format: 0,
                            detail: 0,
                            mode: 'normal',
                            style: '',
                            text: content || '',
                            version: 1,
                        },
                    ],
                    direction: 'ltr',
                },
            ],
            direction: 'ltr',
        },
    }
}
