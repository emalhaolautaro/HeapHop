#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    srand(time(NULL));
    int* arr[100];
    
    // Allocate 100 individuals ints
    for (int i = 0; i < 100; i++) {
        arr[i] = (int*)malloc(sizeof(int));
        *arr[i] = rand();
    }
    
    // Free half of them
    for (int i = 0; i < 50; i++) {
        free(arr[i]);
    }
    
    return 0;
}
