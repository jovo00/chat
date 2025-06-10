use std::path::PathBuf;

use convex::Value;

pub fn pathbuf_to_string(path: &PathBuf) -> String {
    let path_string = String::from(path.to_string_lossy());
    path_string.replace("\\", "/")
}

pub fn get_relative_pathbuf_string(root: &PathBuf, path: &PathBuf) -> String {
    let path_string = pathbuf_to_string(path);
    let root_string = pathbuf_to_string(root) + "/";

    path_string.replace(&root_string, "")
}

pub struct ConvexValueExtractor<'a> {
    value: &'a Value,
}

impl<'a> ConvexValueExtractor<'a> {
    pub fn new(value: &'a Value) -> Self {
        Self { value }
    }

    pub fn get_string(&self, path: &str) -> Option<String> {
        self.get_value_at_path(path).and_then(|v| match v {
            Value::String(s) => Some(s.clone()),
            _ => None,
        })
    }

    pub fn get_i64(&self, path: &str) -> Option<i64> {
        self.get_value_at_path(path).and_then(|v| match v {
            Value::Int64(i) => Some(*i),
            _ => None,
        })
    }

    pub fn get_bool(&self, path: &str) -> Option<bool> {
        self.get_value_at_path(path).and_then(|v| match v {
            Value::Boolean(b) => Some(*b),
            _ => None,
        })
    }

    fn get_value_at_path(&self, path: &str) -> Option<&Value> {
        let parts: Vec<&str> = path.split('.').collect();
        let mut current = self.value;

        for part in parts {
            // Try to parse as array index first
            if let Ok(index) = part.parse::<usize>() {
                current = match current {
                    Value::Array(arr) => arr.get(index)?,
                    _ => return None,
                };
            } else {
                current = match current {
                    Value::Object(obj) => obj.get(part)?,
                    _ => return None,
                };
            }
        }

        Some(current)
    }
}

pub trait ConvexValueExtractorExt {
    fn extract(&self) -> ConvexValueExtractor;
}

impl ConvexValueExtractorExt for Value {
    fn extract(&self) -> ConvexValueExtractor {
        ConvexValueExtractor::new(self)
    }
}
