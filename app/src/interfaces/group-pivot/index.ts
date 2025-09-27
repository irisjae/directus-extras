import { defineInterface } from '@directus/extensions';
import InterfaceGroupPivot from './group-pivot.vue';

export default defineInterface({
	id: 'group-pivot',
	name: '$t:interfaces.group-pivot.name',
	description: '$t:interfaces.group-pivot.description',
	icon: 'view_in_ar',
	component: InterfaceGroupPivot,
	localTypes: ['group'],
	group: 'group',
	types: ['alias'],
	options: [],
});
