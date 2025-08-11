import { configureStore, createSlice, nanoid } from "@reduxjs/toolkit";
import { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Appbar,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  DataTable,
  Divider,
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  Switch,
  TextInput,
} from "react-native-paper";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

/********************
 * Managing State with Redux
 ********************/

const uiSlice = createSlice({
  name: "ui",
  initialState: { darkMode: false, showBanner: true },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    dismissBanner(state) {
      state.showBanner = false;
    },
    showBannerAgain(state) {
      state.showBanner = true;
    },
  },
});

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    reset(state) {
      state.value = 0;
    },
    addByAmount(state, action) {
      state.value += action.payload;
    },
  },
});

const todosSlice = createSlice({
  name: "todos",
  initialState: { items: [] },
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(title) {
        return {
          payload: {
            id: nanoid(),
            title,
            done: false,
            createdAt: Date.now(),
          },
        };
      },
    },
    toggleTodo(state, action) {
      const t = state.items.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
    removeTodo(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    clearTodos(state) {
      state.items = [];
    },
  },
});

const { toggleDarkMode, dismissBanner, showBannerAgain } = uiSlice.actions;
const { increment, decrement, reset, addByAmount } = counterSlice.actions;
const { addTodo, toggleTodo, removeTodo, clearTodos } = todosSlice.actions;

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    counter: counterSlice.reducer,
    todos: todosSlice.reducer,
  },
});

/********************
 * App Root
 ********************/

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemedApp />
    </ReduxProvider>
  );
}

function ThemedApp() {
  const darkMode = useSelector((s) => s.ui.darkMode);
  const theme = useMemo(
    () => (darkMode ? MD3DarkTheme : MD3LightTheme),
    [darkMode]
  );
  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppScaffold />
      </SafeAreaView>
    </PaperProvider>
  );
}

/********************
 * User Interface Design
 ********************/

function AppScaffold() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const showBanner = useSelector((s) => s.ui.showBanner);

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <Appbar.Header>
        <Appbar.Content
          title="Expo + Redux Demo"
          subtitle="Running on your device"
        />
        <DarkModeSwitch />
      </Appbar.Header>

      {showBanner && (
        <Banner
          visible
          actions={[
            {
              label: "Got it",
              onPress: () => dispatch(dismissBanner()),
            },
          ]}
          icon={({ size }) => (
            <Avatar.Icon size={size} icon="information-outline" />
          )}
        >
          This screen demonstrates Redux state and responsive layout.
        </Banner>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          isTablet && styles.contentTablet,
          { paddingBottom: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.column, isTablet && styles.columnTablet]}>
          <CounterCard />
        </View>
        <View style={[styles.column, isTablet && styles.columnTablet]}>
          <TodosCard />
          <CompletedTable />
        </View>
      </ScrollView>

      <Appbar style={styles.footer}>
        <Appbar.Action
          icon="github"
          accessibilityLabel="GitHub"
          onPress={() => {}}
        />
        <Appbar.Content
          title="Footer"
          subtitle={Platform.select({
            ios: "iOS",
            android: "Android",
            default: "Web",
          })}
        />
      </Appbar>
    </View>
  );
}

function DarkModeSwitch() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s) => s.ui.darkMode);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 12,
      }}
    >
      <Text accessibilityRole="header" style={{ marginRight: 8 }}>
        {darkMode ? "Dark" : "Light"}
      </Text>
      <Switch
        value={darkMode}
        onValueChange={() => dispatch(toggleDarkMode())}
        accessibilityLabel="Toggle dark mode"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </View>
  );
}

/********************
 * Cards and Table
 ********************/

function CounterCard() {
  const dispatch = useDispatch();
  const value = useSelector((s) => s.counter.value);
  const [customAmount, setCustomAmount] = useState("1");

  return (
    <Card style={styles.card}>
      <Card.Title
        title="Counter (Redux)"
        subtitle="Actions, reducers, store"
        left={(props) => <Avatar.Icon {...props} icon="counter" />}
      />
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Badge size={32} style={{ marginRight: 12 }}>
            {value}
          </Badge>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              accessibilityLabel="Decrement"
              onPress={() => dispatch(decrement())}
            >
              -1
            </Button>
            <Button
              accessibilityLabel="Increment"
              onPress={() => dispatch(increment())}
            >
              +1
            </Button>
            <Button
              accessibilityLabel="Reset"
              onPress={() => dispatch(reset())}
            >
              Reset
            </Button>
          </View>
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <TextInput
          label="Custom amount"
          keyboardType="number-pad"
          value={customAmount}
          onChangeText={setCustomAmount}
          style={{ marginBottom: 8 }}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            onPress={() => dispatch(addByAmount(Number(customAmount) || 0))}
          >
            Add
          </Button>
          <Button
            onPress={() =>
              dispatch(addByAmount(-(Number(customAmount) || 0)))
            }
          >
            Subtract
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

function TodosCard() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.todos.items);
  const [title, setTitle] = useState("");
  const { width } = useWindowDimensions();
  const numColumns = width >= 900 ? 2 : 1; // responsive list

  // Responsive: re-show banner on every add
  const handleAdd = () => {
    if (!title.trim()) return;
    dispatch(addTodo(title.trim()));
    setTitle("");
    dispatch(showBannerAgain());
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title="Todos (Redux list)"
        subtitle="Responsive FlatList"
        left={(props) => (
          <Avatar.Icon {...props} icon="check-circle-outline" />
        )}
      />
      <Card.Content>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="What needs doing?"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Button onPress={handleAdd}>
            Add
          </Button>
        </View>
        <Divider style={{ marginVertical: 12 }} />

        <FlatList
          data={items}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Card style={{ flex: 1, marginRight: numColumns > 1 ? 8 : 0 }}>
              <Card.Title
                title={item.title}
                subtitle={new Date(item.createdAt).toLocaleString()}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={item.done ? "check" : "circle-outline"}
                  />
                )}
              />
              <Card.Actions>
                <Button onPress={() => dispatch(toggleTodo(item.id))}>
                  {item.done ? "Undo" : "Done"}
                </Button>
                <Button
                  onPress={() => dispatch(removeTodo(item.id))}
                  textColor="#d11"
                >
                  Remove
                </Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <Text accessibilityLabel="Empty list">
              No todos yet. Add one above.
            </Text>
          }
        />
        {items.length > 0 && (
          <Button style={{ marginTop: 8 }} onPress={() => dispatch(clearTodos())}>
            Clear All
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

/**
 * Table component to display completed todos
 */
function CompletedTable() {
  const items = useSelector((s) => s.todos.items);
  const completed = items.filter((item) => item.done);

  if (completed.length === 0) return null;

  return (
    <Card style={styles.card}>
      <Card.Title
        title="Completed Todos"
        left={(props) => <Avatar.Icon {...props} icon="check" />}
      />
      <Card.Content>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={{ flex: 0.7 }}>#</DataTable.Title>
            <DataTable.Title style={{ flex: 2 }}>Title</DataTable.Title>
            <DataTable.Title style={{ flex: 2 }}>Completed At</DataTable.Title>
          </DataTable.Header>
          {completed.map((item, idx) => (
            <DataTable.Row key={item.id}>
              <DataTable.Cell style={{ flex: 0.7 }}>{idx + 1}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 2 }}>{item.title}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 2 }}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card.Content>
    </Card>
  );
}

/********************
 * Styles — mobile‑first, adapt on tablets
 ********************/

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  containerTablet: { paddingHorizontal: 12 },
  content: { flex: 1, padding: 12 },
  contentTablet: { flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  columnTablet: { flex: 1 },
  card: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  footer: { justifyContent: "center" },
});