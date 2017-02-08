import math


# Question 1a
def read_file():
    f = open("lipsum.txt")
    text = f.read()
    f.close()
    print(text)

read_file()


# Question 1b
def read_file():
    f = open("lipsum.txt")
    text = f.read()
    f.close()
    return text.split("\n")

read_file()


# Question 2a
sum = 0
for i in range(10):
    sum += 0.1
    if sum == 0.3:
        break
print(sum)
print("We expected 0.3, didn't get that at all")

# Question 2b
number = 9.3

while number % 0.5 != 0:
    number -= 0.1

print(number)
print("We expected 9.0, not even CLOSE")

# Question 2c
sum = 0
for i in range(10):
    sum += 0.1
    if abs(sum - 0.3) < 1e-6:
        break
print(sum)
print("We expected 0.3, got close enough!")


# Question 3
def quadratic(a, b, c):
    """Performs the quadratic Formula.
        No real roots: returns None
        One real root: returns [root]
        otherwise returns a sorted list of the roots"""

    discr = b**2-4*a*c
    if discr < 0:
        return None
    if discr == 0:
        return [-b/(2*a)]
    retlist = [(-b+math.sqrt(discr))/(2*a),
               (-b-math.sqrt(discr))/(2*a)]
    retlist.sort()
    return retlist

print(quadratic(1, 2, 3))
print(quadratic(1, 0, -2))
print(quadratic(1, 0, 0))
print(quadratic(-17, 5/3, math.pi))


# Question 4
def all_even(minimum, maximum):
    """Returns a list of integers between min and max (inclusive) whose digits (base 10) are all even"""
    values = []
    for i in range(minimum, maximum+1):
        s = str(i)
        alleven = True

        for digit in s:
            if int(digit) % 2 != 0:
                alleven = False
                break

        if alleven:
            values.append(s)

    return values

print(all_even(100, 300))
