import java.util.ArrayList;
import java.util.Random;

public class ArrayTest {
    public static void main(String[] args) {
        ArrayList<Integer> arr = new ArrayList<>(100);
        Random rand = new Random();
        
        for (int i = 0; i < 100; i++) {
            // new Integer object is created through autoboxing
            arr.add(rand.nextInt());
        }
        
        // Remove half
        for (int i = 0; i < 50; i++) {
            arr.remove(arr.size() - 1);
        }
    }
}
