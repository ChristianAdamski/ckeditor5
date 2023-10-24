/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/removestyleblock
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine';

/**
 * Cleanup MS garbage like styles, attributes and elements.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeMSGarbage( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	const elementsToRemove = [];

	for ( const { item } of writer.createRangeIn( documentFragment ) ) {
		if ( !item.is( 'element' ) ) {
			continue;
		}

		const itemClassName = item.getAttribute( 'class' );

		if ( itemClassName && /\bmso/gi.exec( itemClassName ) ) {
			writer.removeAttribute( 'class', item );
		}

		if ( Array.from( item.getStyleNames() ).length ) {
			for ( const styleName of item.getStyleNames() ) {
				if ( /\bmso/gi.exec( styleName ) ) {
					writer.removeStyle( styleName, item );
				}
			}
		}

		if ( item.is( 'element' ) && item.name === 'w:sdt' ) {
			if ( item.is( 'element' ) ) {
				elementsToRemove.push( item );
			}
		}
	}

	for ( const item of elementsToRemove ) {
		const childIndex = documentFragment.getChildIndex( item );
		const firstChild = item.getChild( 0 );

		if ( firstChild && firstChild.is( 'element' ) ) {
			writer.replace( item, firstChild );
		}

		// writer.remove( item );

		// const validChildren = Array.from( item.getChildren() ).filter( child => {
		// 	if ( child.is( '$text' ) ) {
		// 		return true;
		// 	}

		// 	return child.is( 'element' ) && !/\bo:p/gi.exec( child.name ) && !/\b"w:sdtpr"/gi.exec( child.name );
		// } );

		// writer.insertChild( childIndex, item.getChildren(), documentFragment );
		// writer.remove( item );
	}
}
