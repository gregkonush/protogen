import { NullValue, Struct, Value } from "@bufbuild/protobuf";

type ValueResult = {
  string_value?: string;
  number_value?: number;
  null_value?: NullValue;
  bool_value?: boolean;
  list_value?: { values: ValueResult[] };
  struct_value?: { fields: ValueResult };
};

const processValue = (key: string, value: Value): ValueResult => {
  switch (value.kind.case) {
    case "structValue": {
      const struct = value.kind.value;

      const fields = Object.fromEntries(
        Object.entries(struct.fields).map(([entryKey, entryValue]) => [
          entryKey,
          processValue(entryKey, entryValue),
        ])
      );

      return {
        struct_value: {
          fields,
        },
      };
    }
    case "stringValue": {
      return {
        string_value: value.kind.value,
      };
    }
    case "numberValue": {
      return {
        number_value: value.kind.value,
      };
    }
    case "nullValue": {
      return {
        null_value: value.kind.value,
      };
    }
    case "boolValue": {
      return {
        bool_value: value.kind.value,
      };
    }
    case "listValue": {
      const values = value.kind.value.values.map((value) =>
        processValue(key, value)
      );
      return {
        list_value: {
          values,
        },
      };
    }
    default: {
      return {};
    }
  }
};

const processStruct = (input: Struct) => {
  Object.entries(input.fields).map(([key, value]) => {
    const entry = processValue(key, value);
    console.log(
      "=============================== COPY PASTA BELOW ==============================="
    );
    console.log(
      JSON.stringify({ query: { fields: { query: entry } } }, null, 2)
    );
    console.log(
      "=============================== COPY PASTA ABOVE ==============================="
    );
  });
};

processStruct(
  Struct.fromJson({
    query: {
      bool: {
        must: [
          {
            match: {
              text_entry: "love",
            },
          },
        ],
        should: [
          {
            match: {
              text_entry: "life",
            },
          },
          {
            match: {
              text_entry: "grace",
            },
          },
        ],
        minimum_should_match: 1,
        must_not: [
          {
            match: {
              speaker: "ROMEO",
            },
          },
        ],
        filter: {
          term: {
            play_name: "Romeo and Juliet",
          },
        },
      },
    },
  })
);
