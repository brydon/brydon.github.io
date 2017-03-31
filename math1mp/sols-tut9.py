import pandas as pd
import numpy as np

data = {'animal': ['cat', 'cat', 'snake', 'dog', 'dog', 'cat', 'snake', 'cat', 'dog', 'dog'],
        'age': [2.5, 3, 0.5, np.nan, 5, 2, 4.5, np.nan, 7, 3],
        'visits': [1, 3, 2, 3, 2, 3, 1, 1, 2, 1],
        'priority': ['yes', 'yes', 'no', 'yes', 'no', 'no', 'no', 'yes', 'no', 'no']}

labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

# 1
df = pd.DataFrame(data, index=labels)

# 2
print(df.info())
print(df.describe())

# 3
print(df.iloc[:3])

#4
print(df.loc[:, ('animal','age')])

# 5
print(df.ix[[3, 4, 8], ['animal', 'age']])

#6
print(df[df.visits > 3])

#7
print(df[(df.animal == 'cat') & (df['age'] < 3)])

#8
df.loc['k'] = [5.5, 'dog', 'no', 2]
print(df)

# and then deleting the new row...

df = df.drop('k')
print(df)

#9
print(df.visits.sum())

#10
print(df.groupby('animal')['age'].mean())