Piece = Backbone.Model.extend({

	dependencies: function(pathDetails) {
		pathDetails.dependenciesPass = pathDetails.path;

		if (pathDetails.dependenciesPass && this.extraDependencies) {
			pathDetails = $.extend(pathDetails, this.extraDependencies(pathDetails));
		}

		if (pathDetails.dependenciesPass) {
			var pieceIsThere = blackPieces.findWhere({position: pathDetails.newPosition}) || whitePieces.findWhere({position: pathDetails.newPosition});

			if ((pieceIsThere) && (pieceIsThere.get('player') === this.get('player'))) {
				// player already occupies target square

				if (!pathDetails.targeting) {
					// check if targeting function is running
					pathDetails.dependenciesPass = false;
				}
			}

			if (pathDetails.path !== 'l-shape') {

				pathDetails.innerSquares.forEach(function(square) {
					var pieceIsThere = blackPieces.findWhere({position: square}) || whitePieces.findWhere({position: square});

					if (pieceIsThere) {
						// path is blocked
						pathDetails.dependenciesPass = false;
					}
				})
			}
		}

		return pathDetails;
	},

	isPathKnown: function(pathDetails) {
		var pathIsKnown = false;
		if (pathDetails) {
			this.get('paths').forEach(function(path) {
				if (path === pathDetails.path) {
					pathIsKnown = true;
				}
			})
		}

		if(!pathIsKnown) {
			pathDetails.path = false
		}

		return pathDetails;
	},

	validateMove: function(view) {
		var that = this;

		var pathDetails = new chess.setup.PathDetails({
			position: that.get('position'),
			player:   true,
		}) 

		setTimeout(function(){

			pathDetails = that.checkMove(that.targetSquare(pathDetails))

			var pieceIsThere = blackPieces.findWhere({position: pathDetails.newPosition}) || whitePieces.findWhere({position: pathDetails.newPosition});

			pathDetails.dependenciesPass = that.checkKing(that.get('player'), pathDetails, pieceIsThere)

			pathDetails = $.extend(pathDetails, that.finalizeMove(pathDetails, pieceIsThere, view));

			if (pathDetails.dependenciesPass && !pathDetails.promotion.promote) {
				chess.utilities.checkmate(that.get('opponent'), pathDetails)				
			}

			// checking for pawn promotion
			if (pathDetails.promotion.promote) {
				pathDetails.promotion.promote = false;
			
				var pawn = {pawn: pathDetails.promotion.pawn}
				new PromotionView($.extend(pathDetails, pawn))
			}
		},50)

	},

	targetSquare: function(pathDetails) {

		pathDetails.newPercentages = chess.utilities.findClosest(pathDetails);

		pathDetails.newPosition = chess.utilities.reassignId(pathDetails);

		return pathDetails;
	},

	checkMove: function(pathDetails) {

		pathDetails = $.extend(pathDetails, chess.utilities.isAPath(pathDetails));

		pathDetails = $.extend(pathDetails, this.isPathKnown(pathDetails));

		pathDetails = $.extend(pathDetails, this.dependencies(pathDetails));

		return pathDetails;
	},

	checkKing: function(side, pathDetails, pieceIsThere) {

		if (pieceIsThere) {
			if (pieceIsThere.get('player') !== this.get('player')) {
				pieceIsThere.set('position', 'MIA');	
			}
		}

		this.set('position', pathDetails.newPosition)

		return chess.utilities.isKingInCheck(side, pathDetails);

	},

	finalizeMove: function(pathDetails, pieceIsThere, view) {
		if (pathDetails.dependenciesPass) {

			pathDetails.notation.piece = this;


			// view.options.cssPosition = pathDetails.newPercentages;
			// view.$el.css(view.options.cssPosition);
			// view.$el.attr('id', pathDetails.newPosition);
			
			this.set('cssPosition', pathDetails.newPercentages)

			if (pieceIsThere) {
				if (pieceIsThere.get('player') === this.get('opponent')) {
					pieceIsThere.destroy()
					pathDetails.notation.capture = true;
				}				
			}

			pathDetails = $.extend(pathDetails, this.instruct(pathDetails))
		} 

		else {
			this.set('position', pathDetails.position);

			// view.$el.css(view.options.cssPosition);
			view.$el.css(this.get('cssPosition'));
			// this.set('cssPosition', this.get('cssPosition'));

			if (pieceIsThere) {
				if (pieceIsThere.get('position') === 'MIA') {
					pieceIsThere.set('position', pathDetails.newPosition);
				}
			}
		}
	},

	resetPawns: function() {
		var pawns = this.collection.where({'piece': 'pawn'})

		pawns.forEach(function(pawn) {
			pawn.unset('targetSquare')
			pawn.unset('enemyPawn')
		})
	}
})

Pieces = {};








