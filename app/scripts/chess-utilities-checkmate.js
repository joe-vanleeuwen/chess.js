chess.utilities.checkmate = function(opponent, pathDetails) {

	var collection = opponent === 'white' ? whitePieces : blackPieces;

	var counterSquares = [];
	var pieceCanSave = false;

	var king = collection.findWhere({'piece': 'king'})
	var kingPosition = king.get('position');
	var player = collection.at(0).get('player');
	
	if (!chess.utilities.isKingInCheck(player, pathDetails)) {

		var kingCanMove = false

		function checkKing(pathDetails) {
			// an acceptable move barring king not in check
			if (chess.setup.attackedSquares.indexOf(pathDetails.newPosition) < 0) {
		        // found a safe square
		        kingCanMove = true;
		    }
		}

		chess.utilities.squareSearch(chess.utilities.kingMoves(king), player, king, kingPosition, checkKing)

		if (!kingCanMove) {

			var checkmate = true;

			var squaresToCheck = _.union(_.flatten(chess.setup.blockOrCapture));

			collection.each(function(piece) {

				var piecePosition = piece.get('position')

				chess.utilities.squareSearch(squaresToCheck, player, piece, piecePosition, checkPieces)
			})

			function checkPieces(pathDetails) {
				if (chess.utilities.isKingInCheck(player, pathDetails)) {

					if (chess.setup.attackedSquares.indexOf(kingPosition) < 0) {
						// piece can either block or capture
						checkmate = false;
						counterSquares.push(pathDetails.newPosition)
					}
				}
			}

		}

		if (counterSquares.length > 0) {
			counterSquares.forEach(function(square) {
				$('.' + square).css('background', 'rgba(140, 30, 56, 0.8)')
			})
		}

		if (checkmate) {
			pathDetails.notation.checkmate = true;		
		} else {
			pathDetails.notation.check = true;		
		}
		
	} else {
		// check for stalemate
		var pass = false

		function stalemate(i) {
			var piece = collection.at(i)

			if (piece === undefined) {
				return
			}

			chess.utilities.squareSearch(chess.utilities.findAPath(piece), player, piece, piece.get('position'), stalemateCheck)
			
			if (pass) {
				return;
			} else {
				i++;
				stalemate(i)
			}
		}

		function stalemateCheck(pathDetails) {
			if (chess.utilities.isKingInCheck(player, pathDetails)) {

				if (chess.setup.attackedSquares.indexOf(collection.findWhere({'piece': 'king'}).get('position')) < 0) {
					// piece can either block or capture
					pass = true;
				}
			}
		}

		stalemate(0)

		if (!pass) {
			console.log('STALEMATE!!')
			pathDetails.notation.stalemate = true;
		}
	}
	chess.utilities.toPGN(pathDetails);
}

