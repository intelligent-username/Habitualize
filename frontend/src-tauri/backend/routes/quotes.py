from flask import Blueprint, jsonify
from services.services import get_quote_of_the_day

quotes_bp = Blueprint('quotes', __name__)


@quotes_bp.route('/api/quote-of-the-day', methods=['GET'])
def quote_of_the_day():
    quote = get_quote_of_the_day()
    return jsonify(quote)


# NOT USED, But if I create a loading page, will be used.
# Probably won't need a loading page b/c the app is so fast.
@quotes_bp.route('/api/loading-quote', methods=['GET'])
def loading_quote():
    quote = get_quote_of_the_day()
    return jsonify(quote)
