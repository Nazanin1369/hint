/**
 * @fileoverview `typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';

import {
    TypeScriptConfigEvents,
    TypeScriptConfigInvalidJSON,
    TypeScriptConfigInvalidSchema
} from '@hint/parser-typescript-config';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigIsValid implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/is-valid` warns against providing an invalid TypeScript configuration file `tsconfig.json`'
        },
        id: 'typescript-config/is-valid',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext<TypeScriptConfigEvents>) {

        const invalidJSONFile = async (typeScriptConfigInvalid: TypeScriptConfigInvalidJSON, event: string) => {
            const { error, resource } = typeScriptConfigInvalid;

            debug(`${event} received`);

            await context.report(resource, error.message);
        };

        const invalidSchema = async (fetchEnd: TypeScriptConfigInvalidSchema) => {
            const { errors, prettifiedErrors, resource } = fetchEnd;

            debug(`parse::error::typescript-config::schema received`);

            for (let i = 0; i < errors.length; i++) {
                const message = prettifiedErrors[i];
                const location = errors[i].location;

                await context.report(resource, message, { location });
            }
        };

        context.on('parse::error::typescript-config::json', invalidJSONFile);
        context.on('parse::error::typescript-config::circular', invalidJSONFile);
        context.on('parse::error::typescript-config::extends', invalidJSONFile);
        context.on('parse::error::typescript-config::schema', invalidSchema);
    }
}
