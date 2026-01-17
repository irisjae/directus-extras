import type { DeepPartial, Field } from '@directus/types';
import { defineInterface } from '@directus/extensions';
import { useFieldsStore } from '@/stores/fields';
import { useRelationsStore } from '@/stores/relations';
import { useRelationM2O } from '@/composables/use-relation-m2o';
import InterfaceListM2M from './list-m2m.vue';
import PreviewSVG from './preview.svg?raw';

export default defineInterface({
	id: 'list-m2m',
	name: '$t:interfaces.list-m2m.many-to-many',
	description: '$t:interfaces.list-m2m.description',
	icon: 'note_add',
	component: InterfaceListM2M,
	relational: true,
	types: ['alias'],
	localTypes: ['m2m'],
	group: 'relational',
	options: ({ editing, relations, field: { meta } }) => {
		const fieldsStore = useFieldsStore();
		const relationsStore = useRelationsStore();
		const { collection, related_collection } = relations.m2o ?? {};
		const options = meta?.options ?? {};

		const fields = fieldsStore.getFieldsForCollection(collection);

		const pivotTemplateOptions: () => DeepPartial<Field>[] = () => {
			if (!options.pivotField) {
				return [];
			}

			const pivotFields = fields.filter((field) => field.field === options.pivotField);
			
			if (! pivotFields?.[0]?.meta?.special?.includes?.('m2o')) {
				return [];
			}

			const pivotCollection = relationsStore.getRelationsForField(collection, options.pivotField)[0].related_collection;
			
			return [
				{
					field: 'pivotFieldTemplate',
					name: '$t:pivot_field_template',
					meta: {
						interface: 'system-display-template',
						options: {
							collectionName: pivotCollection,
						},
						width: 'full',
					},
				},
			];
		};
		
		const tableOptions: DeepPartial<Field>[] = [
			{
				field: 'tableSpacing',
				name: '$t:layouts.tabular.spacing',
				schema: {
					default_value: 'cozy',
				},
				meta: {
					interface: 'select-dropdown',
					options: {
						choices: [
							{
								text: '$t:layouts.tabular.compact',
								value: 'compact',
							},
							{
								text: '$t:layouts.tabular.cozy',
								value: 'cozy',
							},
							{
								text: '$t:layouts.tabular.comfortable',
								value: 'comfortable',
							},
						],
					},
					width: 'half',
				},
			},
			{
				field: 'nullText',
				name: '$t:null_text',
				meta: {
					interface: 'input',
					width: 'full',
				},
			},
			{
				field: 'virtualTable',
				name: '$t:virtual_table',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					width: 'full',
				},
			},
			{
				field: 'fields',
				name: '$t:columns',
				meta:
					editing === '+'
						? {
								interface: 'presentation-notice',
								options: {
									text: '$t:interfaces.list-m2m.columns_configure_notice',
								},
						  }
						: {
								interface: 'system-fields',
								options: {
									collectionName: collection,
								},
								width: 'full',
						  },
			},
			{
				field: 'pivotField',
				name: '$t:pivot_field',
				meta: {
					interface: 'system-field',
					options: {
						collectionName: collection,
					},
					width: 'full',
				},
			},
			... pivotTemplateOptions(),
			{
				field: 'pivotPlaceholder',
				name: '$t:pivot_placeholder',
				meta: {
					interface: 'input',
					width: 'half',
				},
			},
			{
				field: 'virtualPivotField',
				name: '$t:virtual_pivot_field',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					width: 'half',
				},
			},
			{
				field: 'listExport',
				name: '$t:list_export',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					width: 'full',
					label: '$t:list_export_label',
				},
			},
		];

		const listOptions = [
			{
				field: 'template',
				name: '$t:display_template',
				meta:
					editing === '+'
						? {
								interface: 'presentation-notice',
								options: {
									text: '$t:interfaces.list-m2m.display_template_configure_notice',
								},
						  }
						: {
								interface: 'system-display-template',
								options: {
									collectionName: collection,
								},
						  },
			},
		];

		return [
			{
				field: 'layout',
				name: '$t:layout',
				schema: {
					default_value: 'list',
				},
				meta: {
					interface: 'select-dropdown',
					options: {
						choices: [
							{
								text: '$t:list',
								value: 'list',
							},
							{
								text: '$t:table',
								value: 'table',
							},
						],
					},
					width: 'half',
				},
			},
			...(options.layout === 'table' ? tableOptions : listOptions),
			{
				field: 'enableCreate',
				name: '$t:creating_items',
				schema: {
					default_value: true,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:enable_create_button',
					},
					width: 'half',
				},
			},
			{
				field: 'enableSelect',
				name: '$t:selecting_items',
				schema: {
					default_value: true,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:enable_select_button',
					},
					width: 'half',
				},
			},
			{
				field: 'fieldFilters',
				name: '$t:field_filters',
				type: 'json',
				meta: {
					interface: 'field-filters',
					options: {
						collectionName: collection,
					},
					conditions: [
						{
							rule: {
								enableCreate: {
									_eq: false,
								},
							},
							hidden: true,
						},
					],
				},
			},
			{
				field: 'limit',
				name: '$t:per_page',
				type: 'integer',
				meta: {
					interface: 'input',
					width: 'half',
				},
				schema: {
					default_value: 15,
				},
			},
			{
				field: 'junctionFieldLocation',
				name: '$t:junction_field_location',
				type: 'string',
				schema: {
					default_value: 'bottom',
				},
				meta: {
					interface: 'select-dropdown',
					options: {
						choices: [
							{
								value: 'top',
								text: '$t:top',
							},
							{
								value: 'bottom',
								text: '$t:bottom',
							},
						],
					},
					width: 'half',
				},
			},

			{
				field: 'allowDuplicates',
				name: '$t:allow_duplicates',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					width: 'half',
				},
			},
			{
				field: 'filter',
				name: '$t:filter',
				type: 'json',
				meta: {
					interface: 'system-filter',
					options: {
						collectionName: related_collection,
					},
					conditions: [
						{
							rule: {
								enableSelect: {
									_eq: false,
								},
							},
							hidden: true,
						},
					],
				},
			},
			{
				field: 'enableSearchFilter',
				name: '$t:search_filter',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:enable_search_filter',
					},
					width: 'half',
					hidden: true,
					conditions: [
						{
							rule: {
								layout: {
									_eq: 'table',
								},
							},
							hidden: false,
						},
					],
				},
			},
			{
				field: 'enableLink',
				name: '$t:item_link',
				schema: {
					default_value: false,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:show_link_to_item',
					},
					width: 'half',
				},
			},
		];
	},
	recommendedDisplays: ['related-values'],
	preview: PreviewSVG,
});
