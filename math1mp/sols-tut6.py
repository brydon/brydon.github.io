# Q1a

def add_dictionaries(dict1, dict2):
    """ Concatenates two dictionaries """
    d = dict1.copy()
    for key in dict2:
        d[key] = dict2[key]
    return d

# Q1b

def add_dictionaries(dict1, dict2):
    """ Concatenates two dictionaries, if they have the same keys then values are added """
    d = dict1.copy()
    for key in dict2:
        if key in dict1:
            d[key] += dict2[key]
        else:
            d[key] = dict2[key]
    return d

# Q2a

def no_spaces(d):
    output = d.copy()
    for key in d:
        if " " in key:
            old_value = output.pop(key)
            new_key = key.replace(" ","_")
            output[new_key] = old_value
    return output

# Q2b

def no_spaces(d):
    output = d.copy()
    for key in d:
        if " " in key:
            old_value = output.pop(key)
            new_key = key.replace(" ","_")
            if new_key in d:
                output[new_key] += old_value
    return output

# Q3a

def string_to_dict(s):
    d = {}
    for letter in s:
        if letter in d:
            d[letter] += 1
        else:
            d[letter] = 1
    return d

# Q3cd

f = open("2600-0.txt")
wap_content = f.read()
f.close()

wap_dict = string_to_dict(wap_content)

# Q3e
for letter in "abcdefghijklmnopqrstuvwxyz":
    print(wap_dict[letter])

# Q4a
def dictionary_max(d):
    biggest = None
    for key in d:
        if biggest is None:
            biggest = d[key]
            break
        elif d[key] > biggest:
            biggest = d[key]
            break
    return biggest

# Q4b
def dictionary_max(d):
    biggest_val = None
    biggest_key = None
    for key in d:
        if biggest_val is None or d[key] > biggest_val:
            biggest_val = d[key]
            biggest_key = key
            break
    return biggest_key

# Q4c

def dictionary_max(d, n=1):
    biggest_val = [None]*n
    biggest_key = [None]*n
    for key in d:
        for i in range(n):
            if biggest_val[i] is None or d[key] > biggest_val[i]:
                biggest_val = biggest_val[:i] + [d[key]] + biggest_val[i:-1]
                biggest_key = biggest_key[:i] + [key] + biggest_key[i:-1]
                break
    return biggest_key

print(dictionary_max(wap_dict, 5))
