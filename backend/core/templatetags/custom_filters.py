from django import template
from itertools import zip_longest

register = template.Library()

@register.filter
def zip_lists(list_a, list_b):
    return zip_longest(list_a, list_b, fillvalue = '')