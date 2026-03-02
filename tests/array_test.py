import random

def main():
    arr = []
    
    for _ in range(100):
        # random.random() creates a float object
        arr.append(random.random())
        
    # Delete half
    del arr[:50]

if __name__ == "__main__":
    main()
