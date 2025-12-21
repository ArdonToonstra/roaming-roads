import type { Field } from 'payload';

export const transportFields: Field = {
    name: 'transportation',
    label: 'Transportation Details',
    type: 'group',
    fields: [
        {
            name: 'arrivalMethod',
            type: 'select',
            label: 'How we arrived',
            options: [
                { label: 'Walking', value: 'walking' },
                { label: 'Rental Car', value: 'rental_car' },
                { label: 'Public Bus', value: 'public_bus' },
                { label: 'Taxi/Uber', value: 'taxi' },
                { label: 'Train', value: 'train' },
                { label: 'Flight', value: 'flight' },
                { label: 'Boat/Ferry', value: 'boat' },
                { label: 'Bicycle', value: 'bicycle' },
                { label: 'Hitchhiking', value: 'hitchhiking' },
                { label: 'Tour Bus', value: 'tour_bus' },
                { label: 'Other', value: 'other' },
            ],
        },
        {
            name: 'departureMethod',
            type: 'select',
            label: 'How we left',
            options: [
                { label: 'Walking', value: 'walking' },
                { label: 'Rental Car', value: 'rental_car' },
                { label: 'Public Bus', value: 'public_bus' },
                { label: 'Taxi/Uber', value: 'taxi' },
                { label: 'Train', value: 'train' },
                { label: 'Flight', value: 'flight' },
                { label: 'Boat/Ferry', value: 'boat' },
                { label: 'Bicycle', value: 'bicycle' },
                { label: 'Hitchhiking', value: 'hitchhiking' },
                { label: 'Tour Bus', value: 'tour_bus' },
                { label: 'Other', value: 'other' },
            ],
        },
        {
            name: 'travelTime',
            type: 'group',
            label: 'Travel time to get here',
            fields: [
                {
                    name: 'value',
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'unit',
                    type: 'select',
                    options: [
                        { label: 'Minutes', value: 'minutes' },
                        { label: 'Hours', value: 'hours' },
                        { label: 'Days', value: 'days' },
                    ],
                    defaultValue: 'hours',
                },
            ],
        },
        {
            name: 'distance',
            type: 'group',
            label: 'Distance traveled',
            fields: [
                {
                    name: 'value',
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'unit',
                    type: 'select',
                    options: [
                        { label: 'Kilometers', value: 'km' },
                        { label: 'Miles', value: 'mi' },
                    ],
                    defaultValue: 'km',
                },
            ],
        },
        {
            name: 'transportationNotes',
            type: 'textarea',
            label: 'Transportation notes',
            admin: {
                description: 'Tips, costs, booking info, etc.',
            },
        },
    ],
};
