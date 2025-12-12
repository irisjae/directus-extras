<script setup lang="ts">
import { useCollectionsStore } from '@/stores/collections';
import { useFieldsStore } from '@/stores/fields';
import { useRelationsStore } from '@/stores/relations';
import { Field } from '@directus/types';
import { sortBy } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { extractFieldFromFunction } from '@/utils/extract-field-from-function';

const props = defineProps<{
	value: Record<string, any> | null;
	collectionName: string;
}>();

const emit = defineEmits(['input']);

const collectionsStore = useCollectionsStore();
const fieldsStore = useFieldsStore();
const relationsStore = useRelationsStore();

const fields = computed(() => {
	return fieldsStore.getFieldsForCollection(props.collectionName);
});

const listItems = computed(() =>
	sortBy(
		Object.entries(props.value ?? {}).map(([ fieldName, filter ]) => {
			const field = fields.value.filter((field) => field.field === fieldName)[0];
			const relations = relationsStore.getRelationsForField(field.collection, fieldName);
			const relation = relations[0];
			
			return ({
				field: fieldName,
				displayName: field.name,
				collection: collectionsStore.getCollection(relation.related_collection).name,
				filter: filter,
			});
		}) ?? [],
		'field'
	),
);
const selectItems = computed(() =>
	fields.value?.map((field: Field) => {
		const special = field.meta?.special ?? [];
		const disabled = !special.includes('m2o') && !special.includes('o2m') && !special.includes('file');

		return {
			text: field.name,
			value: field.field,
			disabled,
		};
	}) ?? [],
);

const { t } = useI18n();

const addField = (field: string) => {
	if (!(field in (props.value ?? {}))) {
		emit('input', { ...(props.value ?? {}), [field]: {} } );
	}
};

const removeField = (field: string) => {
	const newFilters = { ...(props.value ?? {}) };
	delete newFilters[field];

	if (Object.keys(newFilters).length === 0) {
		emit('input', null);
	}

	emit('input', newFilters);
};

const setFilter = (field: string, filter: any) => {
	const newFilters = { ...(props.value ?? {}), [field]: filter ?? {} };
	emit('input', newFilters);
};
</script>

<template>
	<v-list v-if="fields.length === 0">
		<v-notice class="no-fields">{{ t('interfaces.field-filters.no_fields') }}</v-notice>
	</v-list>
	<template v-else>
		<v-select
			:items="selectItems"
			:placeholder="t('select_a_field')"
			@update:model-value="addField($event)"
		/>
		<v-list>
			<template v-for="field in listItems" :key="field.field">
				<v-list-item block>
					<div class="name">{{ field.displayName }}</div>
					<div class="spacer" />
					<v-icon name="close" clickable @click="removeField(field.field)" />
				</v-list-item>
				<interface-system-filter
					:collectionName="field.collection"
					:value="field.filter"
					@input="setFilter(field.field, $event)"
				/>
			</template>
		</v-list>
	</template>
</template>

<style lang="scss" scoped>
.v-notice.no-fields {
	background-color: var(--theme--background);
	border: var(--theme--border-width) solid var(--v-list-item-border-color, var(--theme--border-color-subdued));

	&::after {
		display: none;
	}
}
</style>
