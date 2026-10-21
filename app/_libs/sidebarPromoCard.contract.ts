/**
 * Sidebar promo card content contract.
 *
 * Keep this file IDENTICAL in all three repos:
 *   - bb-admin-api  src/modules/admin/admin-sidebar-promo-card/sidebar-promo-card.contract.ts
 *   - bb-admin-app  app/_libs/sidebarPromoCard.contract.ts
 *   - bb-app        app/_libs/sidebarPromoCard.contract.ts
 *
 * bb-admin-api validates `SidebarPromoCard.content` against it on write,
 * bb-admin-app builds it, and bb-app renders it. bb-api passes it through.
 * It has no imports so it can be copied as is.
 *
 * Adding a block type: add it to bb-app first (older bb-app builds skip
 * unknown blocks), then allow it here in bb-admin-api and the builder.
 * Breaking a shape: bump SIDEBAR_PROMO_SCHEMA_VERSION; bb-app ignores cards
 * newer than the version it knows.
 */

export const SIDEBAR_PROMO_SCHEMA_VERSION = 1;

/** Every uploaded media key starts with this (relative to the bucket folder). */
export const SIDEBAR_PROMO_MEDIA_PREFIX = 'admin/sidebar-promo-cards/';

export const SIDEBAR_PROMO_LIMITS = {
    cardWidth: 212,
    /** Past this the builder warns and bb-app clips with a fade. */
    maxCardHeight: 280,
    minBlocks: 1,
    maxBlocks: 12,
    /** JSON.stringify(content).length */
    maxContentLength: 16 * 1024,
    nameMax: 60,
    headingMax: 60,
    textMax: 240,
    buttonLabelMax: 30,
    badgeMax: 20,
    altMax: 120,
    urlMax: 2048,
    iconRowMin: 1,
    iconRowMax: 6,
    imageHeightMin: 60,
    imageHeightMax: 160,
    spacerHeightMin: 2,
    spacerHeightMax: 64,
    textSizeMin: 8,
    textSizeMax: 24,
    headingSizeMin: 10,
    headingSizeMax: 28,
    buttonHeightMin: 20,
    buttonHeightMax: 48,
    iconSizeMin: 12,
    iconSizeMax: 40,
    /** Per-block space above/below, added to the card's gap. Negative pulls blocks closer. */
    blockMarginMin: -16,
    blockMarginMax: 64,
    /** Per-block space left/right, inside the card's padding. Not negative: the card clips it. */
    blockSideMarginMax: 48,
    gradientStopsMin: 2,
    gradientStopsMax: 3,
    uploadMaxBytes: 2 * 1024 * 1024
} as const;

export const SIDEBAR_PROMO_UPLOAD_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
] as const;

export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const COLOR_TOKENS = [
    'card',
    'muted',
    'accent',
    'primary',
    'success',
    'warning',
    'destructive'
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export const PADDINGS = ['sm', 'md', 'lg'] as const; // 10 / 14 / 18px
export const RADII = ['md', 'lg'] as const; // 10 / 14px
export const GAPS = ['sm', 'md', 'lg'] as const; // 6 / 10 / 14px
export const GRADIENT_ANGLES = [0, 45, 90, 135, 180] as const;
export const OVERLAYS = ['none', 'light', 'dark'] as const;
export const ALIGNS = ['start', 'center', 'end'] as const;
export const IMAGE_FITS = ['cover', 'contain'] as const;
export const IMAGE_RADII = ['none', 'sm', 'md'] as const;
/** Quick picks in the builder; any whole number in the iconSize range is allowed. */
export const ICON_SIZES = [16, 18, 20, 24] as const;
export const HEADING_SIZES = ['sm', 'md', 'lg'] as const;
export const HEADING_WEIGHTS = ['medium', 'semibold'] as const;
export const TEXT_SIZES = ['xs', 'sm'] as const;
export const TEXT_TONES = ['default', 'muted'] as const;
export const BUTTON_VARIANTS = ['primary', 'secondary', 'link'] as const;
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const; // 24 / 28 / 34px tall
export const BUTTON_RADII = ['none', 'sm', 'md', 'full'] as const; // 0 / 4 / 8px / pill
export const BUTTON_WEIGHTS = ['medium', 'semibold'] as const;
export const BUTTON_ICONS = ['none', 'arrow', 'external'] as const;
/** Quick picks in the builder; any whole number in the spacerHeight range is allowed. */
export const SPACER_HEIGHTS = [4, 8, 12, 16] as const;

export type Media = {
    /** S3 key relative to the bucket folder, starting with SIDEBAR_PROMO_MEDIA_PREFIX. */
    key: string;
    alt?: string;
};

export type ThemedColor =
    | { type: 'token'; token: ColorToken }
    /** Both required, so dark mode is never forgotten. */
    | { type: 'custom'; light: string; dark: string };

/** Two or three #RRGGBB colours, spread evenly along the gradient. */
export type GradientStops = [string, string] | [string, string, string];

export type CardBackground =
    | { type: 'color'; color: ThemedColor }
    | {
          type: 'gradient';
          light: GradientStops;
          dark: GradientStops;
          angle: (typeof GRADIENT_ANGLES)[number];
      }
    | { type: 'image'; media: Media; overlay: (typeof OVERLAYS)[number] };

export type CardStyle = {
    background: CardBackground;
    padding: (typeof PADDINGS)[number];
    radius: (typeof RADII)[number];
    border: boolean;
    gap: (typeof GAPS)[number];
};

/**
 * Every link (card click, button, inline text link) is either:
 *   - a website: an https:// URL, or
 *   - a bb-app page: a path starting with "/", where ":workspaceId" is replaced
 *     with the viewer's current workspace, e.g.
 *     "/workspace/:workspaceId/settings/integrations". bb-app opens it with
 *     client-side navigation. See isInternalPath and SIDEBAR_PROMO_APP_PAGES.
 *
 * `card`: the whole card is one link, so the blocks may hold no buttons and no
 * inline links (an <a> inside an <a> is invalid and breaks keyboard focus).
 * `none`: links live in button blocks and inline text links only.
 */
export type CardClick = { type: 'card'; url: string; openInNewTab: boolean } | { type: 'none' };

type BlockBase = {
    /** Client-generated, unique within the card. React key and builder selection. */
    id: string;
    /** px added above the block, on top of the card's gap; may be negative. */
    marginTop?: number;
    /** px added below the block, on top of the card's gap; may be negative. */
    marginBottom?: number;
    /** px between the block and the card's left padding. */
    marginLeft?: number;
    /** px between the block and the card's right padding. */
    marginRight?: number;
};

/** Fields every block may have, besides its own. */
const BLOCK_KEYS = ['id', 'type', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];

export type ImageBlock = BlockBase & {
    type: 'image';
    media: Media;
    fit: (typeof IMAGE_FITS)[number];
    height: number;
    radius: (typeof IMAGE_RADII)[number];
};

export type IconRowBlock = BlockBase & {
    type: 'iconRow';
    icons: Media[];
    /** px, a whole number from iconSizeMin to iconSizeMax. */
    size: number;
    align: (typeof ALIGNS)[number];
};

export type HeadingBlock = BlockBase & {
    type: 'heading';
    text: string;
    /** A preset, or px as a whole number from headingSizeMin to headingSizeMax. */
    size: (typeof HEADING_SIZES)[number] | number;
    weight: (typeof HEADING_WEIGHTS)[number];
    align: (typeof ALIGNS)[number];
    color?: ThemedColor;
};

/** `text` supports **bold**, *italic* and [label](https://…). Nothing else. */
export type TextBlock = BlockBase & {
    type: 'text';
    text: string;
    /** A preset, or px as a whole number from textSizeMin to textSizeMax. */
    size: (typeof TEXT_SIZES)[number] | number;
    tone: (typeof TEXT_TONES)[number];
    align: (typeof ALIGNS)[number];
    color?: ThemedColor;
};

export type ButtonBlock = BlockBase & {
    type: 'button';
    label: string;
    url: string;
    openInNewTab: boolean;
    variant: (typeof BUTTON_VARIANTS)[number];
    fullWidth: boolean;
    // Optional: missing means the variant's own look (md, md, medium, none,
    // start), so cards saved before these existed render as they always did.
    /** A preset, or the height in px from buttonHeightMin to buttonHeightMax. */
    size?: (typeof BUTTON_SIZES)[number] | number;
    radius?: (typeof BUTTON_RADII)[number];
    weight?: (typeof BUTTON_WEIGHTS)[number];
    /** A small icon after the label. */
    icon?: (typeof BUTTON_ICONS)[number];
    /** Where the button sits when it isn't full width. */
    align?: (typeof ALIGNS)[number];
    /** Background. Ignored by the link variant. */
    fill?: ThemedColor;
    /** Label colour. Without it, a colour readable on `fill` (or the variant's). */
    textColor?: ThemedColor;
    /** Outline colour. Ignored by the link variant. */
    borderColor?: ThemedColor;
};

export type BadgeBlock = BlockBase & {
    type: 'badge';
    text: string;
    color: ThemedColor;
    align: (typeof ALIGNS)[number];
};

export type SpacerBlock = BlockBase & {
    type: 'spacer';
    /** px, a whole number from spacerHeightMin to spacerHeightMax. */
    height: number;
};

export type DividerBlock = BlockBase & { type: 'divider' };

export type Block =
    | ImageBlock
    | IconRowBlock
    | HeadingBlock
    | TextBlock
    | ButtonBlock
    | BadgeBlock
    | SpacerBlock
    | DividerBlock;

export type BlockType = Block['type'];

export const BLOCK_TYPES: BlockType[] = [
    'image',
    'iconRow',
    'heading',
    'text',
    'button',
    'badge',
    'spacer',
    'divider'
];

export type CardContent = {
    schemaVersion: typeof SIDEBAR_PROMO_SCHEMA_VERSION;
    style: CardStyle;
    click: CardClick;
    blocks: Block[];
};

/** Admin-set audience roles. OWNER is WorkspaceHasUser.isOwner. */
export const SIDEBAR_PROMO_AUDIENCE_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'] as const;

export const SIDEBAR_PROMO_PLANS = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE'] as const;

/** Mirrors GETTING_STARTED_STEP in bb-api src/keys.ts. */
export const SIDEBAR_PROMO_STEPS = [
    'INSTALL_EXTENSION',
    'INVITE_TEAM',
    'CONNECT_INTEGRATION',
    'CONNECT_MCP',
    'CREATE_RECORDING_LINK',
    'INSTALL_SDK'
] as const;

/** The only placeholder an app-page link may use. */
export const WORKSPACE_ID_PLACEHOLDER = ':workspaceId';

/**
 * bb-app pages the builder offers as link targets. Keep in step with bb-app's
 * app/(SidebarHolders) routes; a custom path can still be typed in the builder.
 */
export const SIDEBAR_PROMO_APP_PAGES: { path: string; label: string }[] = [
    { path: '/workspace/:workspaceId/recording-link', label: 'Recording links' },
    { path: '/workspace/:workspaceId/settings/integrations', label: 'Settings › Integrations' },
    { path: '/workspace/:workspaceId/settings/members', label: 'Settings › Members' },
    { path: '/workspace/:workspaceId/settings/plans-usage', label: 'Settings › Plans & usage' },
    { path: '/workspace/:workspaceId/settings/api', label: 'Settings › API' },
    { path: '/workspace/:workspaceId/settings/web-sdk', label: 'Settings › Web SDK' },
    { path: '/workspace/:workspaceId/settings/mobile-sdk', label: 'Settings › Mobile SDK' },
    {
        path: '/workspace/:workspaceId/settings/recording-links',
        label: 'Settings › Recording links'
    },
    { path: '/workspace/:workspaceId/settings/workspace-settings', label: 'Settings › Workspace' },
    { path: '/workspace/:workspaceId/settings/security', label: 'Settings › Security' },
    { path: '/workspace/:workspaceId/settings/sso', label: 'Settings › SSO' },
    { path: '/workspace/:workspaceId/settings/audit-logs', label: 'Settings › Audit logs' },
    { path: '/workspace/:workspaceId/settings/profile', label: 'Settings › Profile' },
    { path: '/workspace/:workspaceId/get-started', label: 'Get started' }
];

/** A card as bb-api serves it to bb-app. */
export type SidebarPromoCardForUser = {
    id: string;
    name: string;
    schemaVersion: number;
    content: CardContent;
    isDismissible: boolean;
};

// ---------------------------------------------------------------------------
// Inline markdown: the only formatting a text block may carry.
// Shared so the validator, the builder and the renderer agree exactly.
// ---------------------------------------------------------------------------

export type InlineToken =
    | { kind: 'text'; text: string }
    | { kind: 'bold'; text: string }
    | { kind: 'italic'; text: string }
    | { kind: 'link'; text: string; href: string };

const INLINE_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Tokenises the markdown subset. Never produces HTML. */
export function tokenizeInline(source: string): InlineToken[] {
    const tokens: InlineToken[] = [];
    const pattern = new RegExp(INLINE_PATTERN.source, 'g');
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
        const index = match.index;
        if (index > last) {
            tokens.push({ kind: 'text', text: source.slice(last, index) });
        }
        if (match[1] !== undefined) {
            tokens.push({ kind: 'bold', text: match[1] });
        } else if (match[2] !== undefined) {
            tokens.push({ kind: 'italic', text: match[2] });
        } else {
            tokens.push({ kind: 'link', text: match[3], href: match[4] });
        }
        last = index + match[0].length;
    }
    if (last < source.length) {
        tokens.push({ kind: 'text', text: source.slice(last) });
    }
    return tokens;
}

export function isHttpsUrl(value: unknown): value is string {
    if (typeof value !== 'string' || value.length > SIDEBAR_PROMO_LIMITS.urlMax) {
        return false;
    }
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
}

const INTERNAL_PATH_PATTERN = /^\/[A-Za-z0-9\-._~/:?=&%#+]*$/;

/**
 * A bb-app page: starts with a single "/", plain URL characters only, and no
 * ":" except the :workspaceId placeholder (so no "javascript:" tricks).
 */
export function isInternalPath(value: unknown): value is string {
    if (typeof value !== 'string' || value.length > SIDEBAR_PROMO_LIMITS.urlMax) {
        return false;
    }
    if (value.indexOf('//') === 0 || !INTERNAL_PATH_PATTERN.test(value)) {
        return false;
    }
    return value.split(WORKSPACE_ID_PLACEHOLDER).join('').indexOf(':') === -1;
}

/** Either kind of link a card may hold. */
export function isAllowedLink(value: unknown): value is string {
    return isHttpsUrl(value) || isInternalPath(value);
}

/**
 * The href to render: websites as they are, app pages with the placeholder
 * filled in. null when the link isn't allowed, or it needs a workspace and
 * there isn't one.
 */
export function resolveLink(
    value: unknown,
    context: { workspaceId?: string | null }
): string | null {
    if (isHttpsUrl(value)) return value;
    if (!isInternalPath(value)) return null;
    if (value.indexOf(WORKSPACE_ID_PLACEHOLDER) === -1) return value;
    if (!context.workspaceId) return null;
    return value.split(WORKSPACE_ID_PLACEHOLDER).join(encodeURIComponent(context.workspaceId));
}

/** Every media key a card references, for validation and S3 cleanup. */
export function collectMediaKeys(content: CardContent): string[] {
    const keys: string[] = [];
    if (content.style?.background?.type === 'image') {
        keys.push(content.style.background.media.key);
    }
    for (const block of content.blocks ?? []) {
        if (block.type === 'image') keys.push(block.media.key);
        if (block.type === 'iconRow') keys.push(...block.icons.map((i) => i.key));
    }
    return keys;
}

// ---------------------------------------------------------------------------
// Validation. bb-admin-api runs it on every write; the builder runs it before
// saving so admins see the same errors inline. Unknown fields are errors.
// ---------------------------------------------------------------------------

export type ContentIssue = { path: string; message: string };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

const oneOf = <T>(list: readonly T[], v: unknown): v is T => list.indexOf(v as T) !== -1;

export function validateCardContent(content: unknown): ContentIssue[] {
    const issues: ContentIssue[] = [];
    const fail = (path: string, message: string) => issues.push({ path, message });

    const only = (value: Obj, path: string, allowed: string[]) => {
        Object.keys(value).forEach((key) => {
            if (allowed.indexOf(key) === -1) fail(`${path}.${key}`, 'Unknown field.');
        });
    };
    const text = (v: unknown, path: string, max: number, required = true) => {
        if (v === undefined && !required) return;
        if (typeof v !== 'string' || (required && !v.trim())) {
            fail(path, 'Required.');
        } else if (v.length > max) {
            fail(path, `At most ${max} characters.`);
        }
    };
    const bool = (v: unknown, path: string) => {
        if (typeof v !== 'boolean') fail(path, 'Must be true or false.');
    };
    const pick = (v: unknown, path: string, list: readonly unknown[], required = true) => {
        if (v === undefined && !required) return;
        if (!oneOf(list, v)) fail(path, `Must be one of: ${list.join(', ')}.`);
    };
    /** A whole number of px in [min, max]. */
    const px = (v: unknown, path: string, min: number, max: number) => {
        if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
            fail(path, `Between ${min} and ${max}.`);
        }
    };
    /** A preset from `list`, or a whole number of px in [min, max]. */
    const pickOrPx = (
        v: unknown,
        path: string,
        list: readonly unknown[],
        min: number,
        max: number,
        required = true
    ) => {
        if (typeof v === 'number') px(v, path, min, max);
        else pick(v, path, list, required);
    };
    const hex = (v: unknown, path: string) => {
        if (typeof v !== 'string' || !HEX_COLOR_PATTERN.test(v)) {
            fail(path, 'Must be a #RRGGBB colour.');
        }
    };
    const url = (v: unknown, path: string) => {
        if (!isAllowedLink(v)) {
            fail(path, 'Must be an https:// link or an app page starting with /.');
        }
    };
    const media = (v: unknown, path: string) => {
        if (!isObj(v)) return fail(path, 'Upload an image.');
        only(v, path, ['key', 'alt']);
        if (
            typeof v.key !== 'string' ||
            v.key.indexOf(SIDEBAR_PROMO_MEDIA_PREFIX) !== 0 ||
            v.key.indexOf('..') !== -1
        ) {
            fail(`${path}.key`, 'Upload an image.');
        }
        text(v.alt, `${path}.alt`, SIDEBAR_PROMO_LIMITS.altMax, false);
    };
    const color = (v: unknown, path: string, required = true) => {
        if (v === undefined && !required) return;
        if (!isObj(v)) return fail(path, 'Pick a colour.');
        if (v.type === 'token') {
            only(v, path, ['type', 'token']);
            pick(v.token, `${path}.token`, COLOR_TOKENS);
        } else if (v.type === 'custom') {
            only(v, path, ['type', 'light', 'dark']);
            hex(v.light, `${path}.light`);
            hex(v.dark, `${path}.dark`);
        } else {
            fail(`${path}.type`, 'Must be token or custom.');
        }
    };

    if (!isObj(content)) {
        fail('content', 'Card content is missing.');
        return issues;
    }
    if (JSON.stringify(content).length > SIDEBAR_PROMO_LIMITS.maxContentLength) {
        fail('content', 'The card is too large.');
    }
    only(content, 'content', ['schemaVersion', 'style', 'click', 'blocks']);
    if (content.schemaVersion !== SIDEBAR_PROMO_SCHEMA_VERSION) {
        fail('content.schemaVersion', `Must be ${SIDEBAR_PROMO_SCHEMA_VERSION}.`);
    }

    // Card style
    const style = content.style;
    if (!isObj(style)) {
        fail('content.style', 'Required.');
    } else {
        only(style, 'content.style', ['background', 'padding', 'radius', 'border', 'gap']);
        pick(style.padding, 'content.style.padding', PADDINGS);
        pick(style.radius, 'content.style.radius', RADII);
        pick(style.gap, 'content.style.gap', GAPS);
        bool(style.border, 'content.style.border');
        const bg = style.background;
        const bgPath = 'content.style.background';
        if (!isObj(bg)) {
            fail(bgPath, 'Required.');
        } else if (bg.type === 'color') {
            only(bg, bgPath, ['type', 'color']);
            color(bg.color, `${bgPath}.color`);
        } else if (bg.type === 'gradient') {
            only(bg, bgPath, ['type', 'light', 'dark', 'angle']);
            (['light', 'dark'] as const).forEach((mode) => {
                const stops = bg[mode];
                if (
                    !Array.isArray(stops) ||
                    stops.length < SIDEBAR_PROMO_LIMITS.gradientStopsMin ||
                    stops.length > SIDEBAR_PROMO_LIMITS.gradientStopsMax
                ) {
                    fail(`${bgPath}.${mode}`, 'Needs two or three colours.');
                } else {
                    stops.forEach((c, i) => hex(c, `${bgPath}.${mode}.${i}`));
                }
            });
            pick(bg.angle, `${bgPath}.angle`, GRADIENT_ANGLES);
        } else if (bg.type === 'image') {
            only(bg, bgPath, ['type', 'media', 'overlay']);
            media(bg.media, `${bgPath}.media`);
            pick(bg.overlay, `${bgPath}.overlay`, OVERLAYS);
        } else {
            fail(`${bgPath}.type`, 'Must be color, gradient or image.');
        }
    }

    // Click action
    const click = content.click;
    const cardIsLink = isObj(click) && click.type === 'card';
    if (!isObj(click)) {
        fail('content.click', 'Required.');
    } else if (click.type === 'card') {
        only(click, 'content.click', ['type', 'url', 'openInNewTab']);
        url(click.url, 'content.click.url');
        bool(click.openInNewTab, 'content.click.openInNewTab');
    } else if (click.type === 'none') {
        only(click, 'content.click', ['type']);
    } else {
        fail('content.click.type', 'Must be card or none.');
    }

    // Blocks
    const blocks = content.blocks;
    if (!Array.isArray(blocks)) {
        fail('content.blocks', 'Required.');
        return issues;
    }
    if (blocks.length < SIDEBAR_PROMO_LIMITS.minBlocks) {
        fail('content.blocks', 'Add at least one block.');
    }
    if (blocks.length > SIDEBAR_PROMO_LIMITS.maxBlocks) {
        fail('content.blocks', `At most ${SIDEBAR_PROMO_LIMITS.maxBlocks} blocks.`);
    }

    const ids: string[] = [];
    blocks.forEach((block, index) => {
        const path = `content.blocks.${index}`;
        if (!isObj(block)) return fail(path, 'Invalid block.');
        if (typeof block.id !== 'string' || !block.id || block.id.length > 40) {
            fail(`${path}.id`, 'Invalid id.');
        } else if (ids.indexOf(block.id) !== -1) {
            fail(`${path}.id`, 'Duplicate id.');
        } else {
            ids.push(block.id);
        }
        (['marginTop', 'marginBottom'] as const).forEach((key) => {
            if (block[key] !== undefined) {
                px(
                    block[key],
                    `${path}.${key}`,
                    SIDEBAR_PROMO_LIMITS.blockMarginMin,
                    SIDEBAR_PROMO_LIMITS.blockMarginMax
                );
            }
        });
        (['marginLeft', 'marginRight'] as const).forEach((key) => {
            if (block[key] !== undefined) {
                px(block[key], `${path}.${key}`, 0, SIDEBAR_PROMO_LIMITS.blockSideMarginMax);
            }
        });

        switch (block.type) {
            case 'image':
                only(block, path, [...BLOCK_KEYS, 'media', 'fit', 'height', 'radius']);
                media(block.media, `${path}.media`);
                pick(block.fit, `${path}.fit`, IMAGE_FITS);
                pick(block.radius, `${path}.radius`, IMAGE_RADII);
                if (
                    typeof block.height !== 'number' ||
                    !Number.isInteger(block.height) ||
                    block.height < SIDEBAR_PROMO_LIMITS.imageHeightMin ||
                    block.height > SIDEBAR_PROMO_LIMITS.imageHeightMax
                ) {
                    fail(
                        `${path}.height`,
                        `Between ${SIDEBAR_PROMO_LIMITS.imageHeightMin} and ${SIDEBAR_PROMO_LIMITS.imageHeightMax}.`
                    );
                }
                break;
            case 'iconRow':
                only(block, path, [...BLOCK_KEYS, 'icons', 'size', 'align']);
                if (
                    !Array.isArray(block.icons) ||
                    block.icons.length < SIDEBAR_PROMO_LIMITS.iconRowMin ||
                    block.icons.length > SIDEBAR_PROMO_LIMITS.iconRowMax
                ) {
                    fail(
                        `${path}.icons`,
                        `Between ${SIDEBAR_PROMO_LIMITS.iconRowMin} and ${SIDEBAR_PROMO_LIMITS.iconRowMax} icons.`
                    );
                } else {
                    block.icons.forEach((icon, i) => media(icon, `${path}.icons.${i}`));
                }
                px(
                    block.size,
                    `${path}.size`,
                    SIDEBAR_PROMO_LIMITS.iconSizeMin,
                    SIDEBAR_PROMO_LIMITS.iconSizeMax
                );
                pick(block.align, `${path}.align`, ALIGNS);
                break;
            case 'heading':
                only(block, path, [...BLOCK_KEYS, 'text', 'size', 'weight', 'align', 'color']);
                text(block.text, `${path}.text`, SIDEBAR_PROMO_LIMITS.headingMax);
                pickOrPx(
                    block.size,
                    `${path}.size`,
                    HEADING_SIZES,
                    SIDEBAR_PROMO_LIMITS.headingSizeMin,
                    SIDEBAR_PROMO_LIMITS.headingSizeMax
                );
                pick(block.weight, `${path}.weight`, HEADING_WEIGHTS);
                pick(block.align, `${path}.align`, ALIGNS);
                color(block.color, `${path}.color`, false);
                break;
            case 'text':
                only(block, path, [...BLOCK_KEYS, 'text', 'size', 'tone', 'align', 'color']);
                text(block.text, `${path}.text`, SIDEBAR_PROMO_LIMITS.textMax);
                pickOrPx(
                    block.size,
                    `${path}.size`,
                    TEXT_SIZES,
                    SIDEBAR_PROMO_LIMITS.textSizeMin,
                    SIDEBAR_PROMO_LIMITS.textSizeMax
                );
                pick(block.tone, `${path}.tone`, TEXT_TONES);
                pick(block.align, `${path}.align`, ALIGNS);
                color(block.color, `${path}.color`, false);
                if (typeof block.text === 'string') {
                    tokenizeInline(block.text).forEach((token) => {
                        if (token.kind !== 'link') return;
                        if (cardIsLink) {
                            fail(`${path}.text`, 'Remove links: the whole card is already a link.');
                        } else if (!isAllowedLink(token.href)) {
                            fail(
                                `${path}.text`,
                                `Link "${token.text}" must be an https:// link or an app page starting with /.`
                            );
                        }
                    });
                }
                break;
            case 'button':
                only(block, path, [
                    ...BLOCK_KEYS,
                    'label',
                    'url',
                    'openInNewTab',
                    'variant',
                    'fullWidth',
                    'size',
                    'radius',
                    'weight',
                    'icon',
                    'align',
                    'fill',
                    'textColor',
                    'borderColor'
                ]);
                if (cardIsLink) {
                    fail(path, 'Remove buttons: the whole card is already a link.');
                }
                text(block.label, `${path}.label`, SIDEBAR_PROMO_LIMITS.buttonLabelMax);
                url(block.url, `${path}.url`);
                bool(block.openInNewTab, `${path}.openInNewTab`);
                pick(block.variant, `${path}.variant`, BUTTON_VARIANTS);
                bool(block.fullWidth, `${path}.fullWidth`);
                pickOrPx(
                    block.size,
                    `${path}.size`,
                    BUTTON_SIZES,
                    SIDEBAR_PROMO_LIMITS.buttonHeightMin,
                    SIDEBAR_PROMO_LIMITS.buttonHeightMax,
                    false
                );
                pick(block.radius, `${path}.radius`, BUTTON_RADII, false);
                pick(block.weight, `${path}.weight`, BUTTON_WEIGHTS, false);
                pick(block.icon, `${path}.icon`, BUTTON_ICONS, false);
                pick(block.align, `${path}.align`, ALIGNS, false);
                color(block.fill, `${path}.fill`, false);
                color(block.textColor, `${path}.textColor`, false);
                color(block.borderColor, `${path}.borderColor`, false);
                break;
            case 'badge':
                only(block, path, [...BLOCK_KEYS, 'text', 'color', 'align']);
                text(block.text, `${path}.text`, SIDEBAR_PROMO_LIMITS.badgeMax);
                color(block.color, `${path}.color`);
                pick(block.align, `${path}.align`, ALIGNS);
                break;
            case 'spacer':
                only(block, path, [...BLOCK_KEYS, 'height']);
                px(
                    block.height,
                    `${path}.height`,
                    SIDEBAR_PROMO_LIMITS.spacerHeightMin,
                    SIDEBAR_PROMO_LIMITS.spacerHeightMax
                );
                break;
            case 'divider':
                only(block, path, BLOCK_KEYS);
                break;
            default:
                fail(`${path}.type`, 'Unknown block type.');
        }
    });

    return issues;
}
