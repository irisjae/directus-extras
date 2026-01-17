import type { Table } from '@directus/schema';

type Translations = {
	language: string;
	translation: string;
	singular: string;
	plural: string;
};

export type CollectionMeta = {
	collection: string;
	note: string | null;
	hidden: boolean;
	singleton: boolean;
	read_only: boolean;
	icon: string | null;
	color: string | null;
	translations: Translations[] | null;
	display_template: string | null;
	preview_url: string | null;
	versioning: boolean;
	sort_field: string | null;
	name_field: string | null;
	range_field: string | null;
	archive_field: string | null;
	archive_value: string | null;
	unarchive_value: string | null;
	archive_app_filter: boolean;
	item_duplication_fields: string[] | null;
	accountability: 'all' | 'activity' | null;
	system: boolean | null;
	sort: number | null;
	group: string | null;
	collapse: 'open' | 'closed' | 'locked';
	kind?: 'view' | 'materialized_view' | 'table' | 'foreign_table';
	definition?: string;
};

export interface Collection {
	collection: string;
	meta: CollectionMeta | null;
	schema: Table | null;
}

export interface AppCollection extends Collection {
	name: string;
	icon: string;
	type: CollectionType;
	color?: string | null;
}

export type CollectionType = 'alias' | 'table' | 'unknown';
