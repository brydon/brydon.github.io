def number_to_day(n):
    """
    Takes a number, returns a string representing day of the week
    :param n:
    :return Day of the week as a string:
    """
    if n == 1:
        return "Sunday"
    elif n == 2:
        return "Monday"
    elif n == 3:
        return "Tuesday"
    elif n == 4:
        return "Wednesday"
    elif n == 5:
        return "Thursday"
    elif n == 6:
        return "Friday"
    elif n == 7:
        return "Saturday"


def my_max(in_list):
    """
    Returns the maximum of the list
    :param in_list:
    :return the maximal element in the in_list:
    """
    biggest = in_list[0]
    for l in in_list:
        if l > biggest:
            biggest = l
    return biggest


def case_count(in_string):
    """
    Counts the number of lower and upper case letters in a string
    :param in_string:
    :return list of two numbers, first number how many lowercase letters, second number how many uppercase letters:
    """
    uppercase_count = 0
    lowercase_count = 0

    for letter in in_string:
        if letter != " ":
            if letter == letter.upper():
                uppercase_count += 1
            else:
                lowercase_count += 1

    return [lowercase_count, uppercase_count]


def make_unique(in_list):
    """
    Removes duplicates from a list, preserving ordering of the first appearance of an element
    :param in_list:
    :return a set of unique elements of in_list:
    """
    new_list = []
    for l in in_list:
        if l not in new_list:
            new_list.append(l)
    return new_list


def is_prime(n):
    """
    Tests if a number n is prime
    :param n:
    :return True/False:
    """
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True


def only_even(in_list):
    """
    Creates a new list of even elements of the input list
    :param in_list:
    :return a new list of even elements of list:
    """
    new_list = []
    for l in in_list:
        if l % 2 == 0:
            new_list.append(l)
    return new_list


def make_primes(n):
    """
    Makes a list of primes less than n
    :param n:
    :return a list of all primes less than n:
    """
    out_list = []
    for i in range(2, n):
        if is_prime(i):
            out_list.append(i)
    return out_list


if __name__ == "__main__":
    # Run all the test cases!
    # This should all return True, otherwise something's wrong!
    print("Question 1")
    print(number_to_day(1) == "Sunday")

    print("Question 2")
    print(my_max([1, 2, 3]) == 3)
    print(my_max([1, 0, 100, -2]) == 100)
    print(my_max([-1, -2, -3]) == -1)

    print("Question 3")
    print(case_count("The Quick Brown Fox") == [12, 4])

    print("Question 4")
    print(make_unique([1, 2, 3, 3, 4, 4, 6, 5, 5, 5, 7, 5]) == [1, 2, 3, 4, 6, 5, 7])

    print("Question 5")
    print(is_prime(23))
    print(is_prime(161) is False)
    print(is_prime(211))

    print("Question 6")
    print(only_even([1, 2, 3, 4, -1, -2, 9, 27, 32, 2]) == [2, 4, -2, 32, 2])

    print("Question 7")
    print(make_primes(10) == [2, 3, 5, 7])
    print(make_primes(50) == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47])
