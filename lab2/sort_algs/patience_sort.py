def patience_sort(collection):
    piles = []  # A list of piles of cards
    for item in collection:
        new_pile = [item]
        for pile in piles:
            if item < pile[-1]:  # If the item is smaller than the last card in the pile
                pile.append(item)  # Add the item to the pile
                break
        else:
            piles.append(new_pile)  # If the item is larger than all the piles, create a new pile for it

    sorted_list = []  # A list of sorted cards
    while piles:
        smallest_pile = min(piles, key=lambda pile: pile[-1])  # Find the smallest pile by comparing the last cards
        sorted_list.append(smallest_pile.pop())  # Remove the last card from the smallest pile and add it to the sorted list
        if not smallest_pile:  # If the smallest pile is empty, remove it from the list of piles
            piles.remove(smallest_pile)

    for i in range(len(collection)):
        collection[i] = sorted_list[i]

    return
