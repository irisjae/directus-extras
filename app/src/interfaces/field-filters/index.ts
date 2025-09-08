import { defineInterface } from '@directus/extensions';
import InterfaceFieldFilters from './field-filters.vue';

export default defineInterface({
	id: 'field-filters',
	name: '$t:interfaces.field-filters.field_filters',
	description: '$t:interfaces.field-filters.description',
	icon: 'search',
	component: InterfaceFieldFilters,
	types: ['json'],
	system: true,
});
