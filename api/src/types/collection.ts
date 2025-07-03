import type { Field } from '@directus/types';
import type { Table } from '@directus/schema';
import type { BaseCollectionMeta } from '@directus/system-data';

export type CollectionMeta = {
	collection: string;
	note: string | null;
	hidden: boolean;
	singleton: boolean;
	icon: string | null;
	translations: Record<string, string>;
	item_duplication_fields: string[] | null;
	accountability: 'all' | 'accountability' | null;
	group: string | null;
	kind?: 'table' | 'view' | 'materialized_view' | 'foreign_table';
	definition?: string;
};

export type Collection = {
	collection: string;
	fields?: Field[];
	meta: BaseCollectionMeta | null;
	schema: Table | null;
};
