<script setup lang="ts">
import { provide, inject, ref, computed, toRefs } from 'vue';
import { Field, ValidationError } from '@directus/types';
import { useRelationO2M } from '@/composables/use-relation-o2m';
import { usePivot } from '@/composables/use-pivot';

const props = withDefaults(
	defineProps<{
		field: Field;
		fields: Field[];
		fieldNames: string[];
		fieldsForGroup: Field[][];
		width: string;
		values: Record<string, unknown>;
		initialValues: Record<string, unknown>;
		primaryKey: number | string;
		disabled?: boolean;
		batchMode?: boolean;
		batchActiveFields?: string[];
		loading?: boolean;
		validationErrors?: ValidationError[];
		badge?: string;
		rawEditorEnabled?: boolean;
		direction?: string;
	}>(),
	{
		batchActiveFields: () => [],
		validationErrors: () => [],
	},
);

defineEmits(['apply']);

const { primaryKey } = toRefs(props);
const parentGroupPivots = inject('groupPivots', {});
const expandedFields = (fields) => {
	const expandedFields = [];
	for (let field of fields) {
		const fieldIndex = props.fieldNames.indexOf(field.field);
		if (props.fieldsForGroup[fieldIndex]) {
			expandedFields.push(...expandedFields(props.fieldsForGroup[fieldIndex]));
		} else {
			expandedFields.push(field);
		}
	 }
	return expandedFields
};
const groupPivots = (
	Object.fromEntries(
		Object.entries(Object.fromEntries(
			expandedFields(props.fields).filter((field) => 
				(field.meta?.special ?? []).includes('o2m')
				&& !!field.meta?.options?.pivotField
				&& !(field.meta!.options!.pivotField in parentGroupPivots)
			).reverse().map((field) => {
				const options = field.meta?.options;
				const { relationInfo } = useRelationO2M(ref(field.collection), ref(field.field));
				
				const pivot = ref(null);
				const { fetchedItems: pivots } = usePivot(props.field.collection, props.field.field, primaryKey, relationInfo.value, options.pivotField, options.pivotFieldTemplate, options.virtualPivotField);
				const pivotItems = computed(() => {
					return [
						{ text: options.pivotPlaceholder || 'Default', value: null },
						... pivots.value.map(({ pivotDisplay, pivot }) => ({
							text: pivotDisplay,
							value: pivot,
						}))
					];
				});
				
				return [
					options.pivotField,
					{
						pivot,
						pivots,
						pivotItems,
					}
				];
			})
		)).reverse()
	)
);
provide('groupPivots', {... groupPivots, ... parentGroupPivots});

</script>

<template>
	<div>
		<div v-if="Object.keys(groupPivots).length != 0" class="actions">
			<v-select
				v-for="[ field, pivotInfo ] in Object.entries(groupPivots)"
				:key="field"
				:model-value="pivotInfo.pivot.value"
				@update:model-value="pivotInfo.pivot.value = $event"
				:fullWidth="false"
				:items="pivotInfo.pivotItems.value"
				class="pivot-select"
			/>
		</div>
		<v-form
			:initial-values="initialValues"
			:fields="fields"
			:model-value="values"
			:primary-key="primaryKey"
			:group="field.meta?.field"
			:validation-errors="validationErrors"
			:loading="loading"
			:disabled="disabled"
			:badge="badge"
			:raw-editor-enabled="rawEditorEnabled"
			:direction="direction"
			:show-no-visible-fields="false"
			:show-validation-errors="false"
			@update:model-value="$emit('apply', $event)"
		/>
	</div>
</template>

<style lang="scss" scoped>
.actions {
	margin-bottom: 40px;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}
</style>
