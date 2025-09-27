import api from '@/api';
import { useRelationsStore } from '@/stores/relations';
import { adjustFieldsForDisplays } from '@/utils/adjust-fields-for-displays';
import { unexpectedError } from '@/utils/unexpected-error';
import { getFieldsFromTemplate } from '@directus/utils';
import { getEndpoint, toArray } from '@directus/utils';
import { clamp, cloneDeep, get, isEqual, merge } from 'lodash';
import { Ref, computed, toRef, ref, watch } from 'vue';

export function usePivot(
	itemId: Ref<string | number | null>,
	relationInfo: RelationO2M,
	pivotField?: string,
	pivotTemplate?: string,
	virtualPivotField?: boolean,
) {
	const { relatedCollection, reverseJunctionField } = relationInfo;
	const loading = ref(false);
	const fetchedItems = ref<Record<string, any>[]>([]);

	watch(
		[itemId],
		(newData, oldData) => {
			if (!isEqual(newData, oldData)) {
				updateFetchedItems();
			}
		},
		{ immediate: true },
	);

	return {
		fetchedItems,
		loading
	};
	
	async function updateFetchedItems() {
		if (pivotField && itemId.value !== '+') {
			const fields = [
				pivotField,
				... (pivotTemplate ?
					[ `${pivotField}.id` ] // SOON -- get id field
				: []),
				... (pivotTemplate ?
					adjustFieldsForDisplays(
						getFieldsFromTemplate(pivotTemplate),
						relatedCollection.collection
					).map((field) => `${pivotField}.${field}`)
				: []), 
			];
			try {
				loading.value = true;

				const params = {
					fields: fields,
					groupBy: [ pivotField ],
					limit: -1,
					... virtualPivotField ? {
						meta: [{ virtual: [ itemId.value ] }]
					} : { [reverseJunctionField.field]: itemId.value }
				};
				const response = await api.get(getEndpoint(relatedCollection.collection), {
					params,
				});

				fetchedItems.value = response.data.data.filter((item) => item[pivotField] !== null).map((item) => {
					return {
						pivotDisplay: pivotTemplate ?
								pivotTemplate
									.split(/({{.*?}})/g)
									.filter((p) => p)
									.map((part) => {
										if (part.startsWith('{{') === false) return part;

										const fieldKey = part.replace(/{{/g, '').replace(/}}/g, '').trim();

										return getNestedValues(item[pivotField], fieldKey);
									})
									.join('')
							: item[pivotField],
						pivot: pivotTemplate ? item[pivotField].id : item[pivotField],
						... item
					};
				}).sort((a, b) => {
					if (a.pivot > b.pivot) {
						return +1;
					} else if (a.pivot < b.pivot) {
						return -1;
					} else {
						return 0;
					}
				});
			} catch (error) {
				unexpectedError(error);
			} finally {
				loading.value = false;
			}
		}
	}
	function getNestedValues (data: any, path: string) {
		const pathParts = path.split('.');
		let currentData = data;

		pathParts.filter(partWithoutDollarPrefix).forEach((part) => {
			currentData = get(currentData, part) ?? null;
		});

		return Array.isArray(currentData) ? currentData : [currentData];

		function partWithoutDollarPrefix(part: string) {
			// For example `$thumbnail`
			return !part.startsWith('$');
		}
	};
}
